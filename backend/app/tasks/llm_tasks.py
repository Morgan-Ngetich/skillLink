import json
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.core.celery import celery_app
from app.utils.validation import with_session
from typing import Dict, Any


@celery_app.task(
    name="app.tasks.process_goal_completion",
    bind=True,
    queue="llm",
    time_limit=300,  # 5 minutes
    autoretry_for=(Exception,),
    retry_kwargs={"max_retries": 3},
)
@with_session
def process_goal_completion(
    self,
    goal_id: int,
    user_id: int,
    *,
    session: Session,
) -> Dict[str, Any]:
    """Automatically generate roadmap and tasks for a new goal"""
    from app.utils.llm_service import call_llm_service, build_goal_context
    from app.utils.logger_config import llm_logger
    from app.models import (
        LLMGenerationRequest,
        LLMTargetEntity,
        LLMStructuredOutput,
        LLMGenerationResponse,
        Goal,
        GoalStatus,
        User,
    )
    from app.crud import create_roadmap_from_llm, create_board_from_llm
  
    roadmap = None
    try:
        current_user = session.get(User, user_id)
        goal = session.get(Goal, goal_id)

        if not all([current_user, goal]):
            raise HTTPException(status_code=404, detail="User or Goal not found")

        # Build specialized request
        llm_request = LLMGenerationRequest(
            prompt=f"Create complete implementation plan for: {goal.title}",
            target_entities=[LLMTargetEntity.ROADMAPS, LLMTargetEntity.CARDS],
            context=build_goal_context(session, current_user, goal=goal),
        )

        # Call LLM
        llm_response: LLMGenerationResponse = call_llm_service(llm_request)
        print("LLM Response:", llm_response.model_dump_json(indent=2))
        result = {"generated_roadmap": False, "generated_cards": 0, "generated_board": False, "errors": []}

        # Process creations if they exist
        if (
            isinstance(llm_response.output, LLMStructuredOutput)
            and llm_response.output.creations
        ):
            creations = llm_response.output.creations
            
            # Create roadmap first if exists
            if creations.get("roadmaps"):
                try:
                    roadmap = create_roadmap_from_llm(
                        session=session,
                        llm_data=creations["roadmaps"][0],
                        owner_id=user_id,
                    )
                    result["generated_roadmap"] = True
                except Exception as e:
                    result["errors"].append(f"Roadmap creation failed: {str(e)}")

            # Create board which will automatically create lists and cards
            # Check for boards_with_lists data stored as custom attribute
            if creations.get("boards_with_lists"):
                try:
                    # Get the first board structure
                    board_structure = creations["boards_with_lists"][0]
                    board_data = board_structure["board"]
                    lists_data = board_structure["lists"]
                    
                    # Extract all cards from all lists
                    cards_data = []
                    for list_info in lists_data:
                        if "cards" in list_info and list_info["cards"]:
                            cards_data.extend(list_info["cards"])
                    
                    print(f"DEBUG: About to create board '{board_data.title}' with {len(cards_data)} cards")
                    for i, card in enumerate(cards_data):
                        print(f"DEBUG: Card {i}: '{card.get('title') if hasattr(card, 'get') else getattr(card, 'title', 'Unknown')}'")
                                                               
                    board, cards_created = create_board_from_llm(
                        session=session,
                        llm_data=board_data,
                        owner_id=user_id,
                        roadmap_id=roadmap.id if roadmap else None,
                        goal_id=goal_id,
                        cards_data=cards_data
                    )                    
                    result["generated_board"] = True
                    result["generated_cards"] = cards_created
                   
                except Exception as e:
                    result["errors"].append(f"Board creation failed: {str(e)}")
            
            # Fallback: Check for regular 'boards' if _boards_with_lists doesn't exist
            elif creations.get("boards"):
                try:
                    board_data = creations["boards"][0]
                    cards_data = creations.get("cards", [])
                    
                    print(f"DEBUG: Fallback - About to create board '{board_data.title}' with {len(cards_data)} cards")
                                                               
                    board, cards_created = create_board_from_llm(
                        session=session,
                        llm_data=board_data,
                        owner_id=user_id,
                        roadmap_id=roadmap.id if roadmap else None,
                        goal_id=goal_id,
                        cards_data=cards_data
                    )                    
                    result["generated_board"] = True
                    result["generated_cards"] = cards_created
                   
                except Exception as e:
                    result["errors"].append(f"Board creation failed: {str(e)}")
                                
            # Update goal status
            goal.status = GoalStatus.IN_PROGRESS
            if roadmap:
                goal.roadmap_id = roadmap.id
            goal.is_llm_generated = True
            session.add(goal)
            session.commit()

            return {"status": "success", "goal_id": goal.id, **result}

    except Exception as e:
        llm_logger.error(
            f"Goal completion failed for goal {goal_id}",
            exc_info=e,
            extra={"attempt": self.request.retries},
        )

        # Mark goal as failed
        if goal and "goal" in locals():
            goal.is_llm_generated = False
            session.add(goal)
            session.commit()

        raise self.retry(exc=e)

@celery_app.task(
    name="app.tasks.process_llm_generation",
    bind=True,
    queue="llm",
    time_limit=600,  # 10 minutes
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
    acks_late=True,
)
@with_session
def process_llm_generation(
    self,
    llm_request_json: str,
    user_id: int,
    *,
    session: Session,
) -> Dict[str, Any]:
    """Celery task to process LLM generation requests"""
    from app.utils.llm_service import (
        build_goal_context,
        call_llm_service,
        check_goal_update_safety,
        suggest_progressive_steps,
    )
    from app.models import (
        User,
        LLMGenerationRequest,
        LLMActionType,
        LLMStructuredOutput,
        LLMGenerationResponse,
    )
    from app.utils.logger_config import llm_logger
    from app.crud import create_goal_from_llm

    user = None
    
    try:
        user = session.get(User, user_id)
        if not user:
            raise ValueError("User not found")
        
        llm_request = LLMGenerationRequest(**json.loads(llm_request_json))

        if not llm_request.context:
            llm_request.context = build_goal_context(session, user)
            
        llm_response: LLMGenerationResponse = call_llm_service(llm_request)
        result = {"created_goals": [], "errors": []}

        if llm_request.action.value == LLMActionType.UPDATE and llm_response.output.updates:
            for update in llm_response.output.updates:
                safety_report = check_goal_update_safety(session, update, user)
                llm_response.safety_check = safety_report

                if not safety_report.passes:
                    llm_response.output.progressive_updates = suggest_progressive_steps(
                        session, update, user
                    )

        # --- Handle new goal creation and plan generation ---
        if (
            llm_request.action.value == LLMActionType.CREATE
            and isinstance(llm_response.output, LLMStructuredOutput)
            and llm_response.output.creations
        ):
            for goal_data in llm_response.output.creations.get("goals", []):
                try:
                    goal = create_goal_from_llm(
                        session=session, 
                        llm_data=goal_data, 
                        owner_id=user_id
                    )
                    result["created_goals"].append(goal.id)

                    process_goal_completion.delay(goal.id, user_id)

                except Exception as e:
                    result["errors"].append(f"Goal creation failed: {str(e)}")

            return {
                "status": "success" if not result["errors"] else "partial_success",
                "response": llm_response.model_dump(exclude={"output": {"creations"}}),
                **result,
            }

    except Exception as e:
        llm_logger.error(
            f"LLM generation failed for user {user.id if user else 'N/A'}", exc_info=e
        )
        raise self.retry(exc=e)


@celery_app.task(
    name="app.tasks.process_progressive_update",
    bind=True,
    queue="default",
    time_limit=120,  # 2 minutes
    autoretry_for=(Exception,),
    retry_kwargs={"max_retries": 2},
)
@with_session
def process_progressive_update(
    self,
    proposal_json: str,
    user_id: int,
    *,
    session: Session,
) -> Dict[str, Any]:
    """Celery task for processing progressive goal updates"""
    from app.models import User, ProgressiveUpdateProposal, Goal
    from app.utils.logger_config import llm_logger

    try:
        proposal = ProgressiveUpdateProposal(**json.loads(proposal_json))
        user = session.get(User, user_id)
        
        if not user:
            raise ValueError("User not found")
        if not proposal.intermediate_step:
            raise ValueError("Intermediate step data required")
            
        # Create intermediate goal
        intermediate_goal = Goal(
            **proposal.intermediate_step,
            owner_id=user_id,
            is_llm_generated=True
        )
        session.add(intermediate_goal)
        
        # Update final goal if specified
        if proposal.final_goal and proposal.final_goal.get("id"):
            final_goal = session.get(Goal, proposal.final_goal["id"])
            if final_goal:
                final_goal.parent_goal_id = intermediate_goal.id
                session.add(final_goal)
        
        session.commit()
        
        return {
            "status": "success",
            "goal_id": intermediate_goal.id,
            "user_id": user_id
        }
        
    except json.JSONDecodeError:
        raise ValueError("Invalid proposal JSON")
    except Exception as e:
        session.rollback()
        llm_logger.error(f"Progressive update failed: {str(e)}")
        raise self.retry(exc=e)