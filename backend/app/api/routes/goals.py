import json
from fastapi import APIRouter, HTTPException, BackgroundTasks
from sqlmodel import select
from sqlalchemy import func
from sqlalchemy.orm import selectinload  
from typing import List, Optional
from app.api.deps import CurrentUser, SessionDep
from app.core.celery import celery_app
from app.models import (
    Card,
    Goal,
    GoalUpdate,
    LLMGenerationRequest,
    LLMGenerationResponse,
    LLMTargetEntity,
    ProgressiveUpdateProposal,
    RoadmapDisplay,
    RoadmapVisibility,
    Roadmap,
    RoadmapPublic,
    RoadmapUpdate,
    GoalCreationRequest,
    Board,
    BoardList,
    TaskStatus,
    TaskStatusEnum
)
from app.tasks.llm_tasks import (
    process_llm_generation,
    process_progressive_update,
)
from app.utils.llm_service import build_goal_context

router = APIRouter()


@router.post("/", response_model=dict)
def create_goal(
    *, 
    session: SessionDep, 
    current_user: CurrentUser, 
    goal_in: GoalCreationRequest
) -> Goal:
    """Create a goal with optional AI-generated roadmap and tasks"""
    # Create base goal
    goal_data = goal_in.model_dump(exclude={"generate_plan", "ai_settings"})
    goal = Goal(**goal_data, owner_id=current_user.id)
    session.add(goal)
    
    session.commit()
    
    task_status = None

    # Trigger AI generation if requested
    if goal_in.generate_plan:
        llm_request = LLMGenerationRequest(
            prompt=f"Create detailed plan for: {goal.title}",
            context={
                **build_goal_context(session, current_user, goal=goal),
                "timeframe": {
                    "start_date": goal.start_date.isoformat() if goal.start_date else None,
                    "end_date": goal.target_date.isoformat() if goal.target_date else None
                }
            },
            target_entities=[LLMTargetEntity.ROADMAPS, LLMTargetEntity.CARDS],
            **(goal_in.ai_settings or {})
        )
        
        task = process_llm_generation.delay(
            llm_request_json=json.dumps(llm_request.model_dump()),
            # goal_id=goal.id,
            user_id=current_user.id,
        )
        
        task_status = TaskStatus(
            task_id=task.id,
            status=TaskStatusEnum.PROCESSING,
            message="Your goal plan is being generated."
        )

    return {
        "goal": goal,
        "task": task_status
    }

@router.get("/roadmaps", response_model=List[RoadmapPublic])
def get_all_roadmap(session: SessionDep, current_user: CurrentUser):
    """Get all user's roadmaps"""
    roadmaps = session.exec(
        select(Roadmap).where(Roadmap.owner_id == current_user.id)
    ).all()
    return roadmaps

@router.get("/roadmaps/{roadmap_id}/full", response_model=RoadmapDisplay)
def get_roadmap_details(roadmap_id: int, session: SessionDep, current_user: CurrentUser):
    """Get full roadmap display. (roadmap, goals, boards)"""
    roadmap = session.exec(
        select(Roadmap)
        .where(Roadmap.id == roadmap_id)
        .options(
            # Load goals with their cards, subgoals, and subgoal cards
            selectinload(Roadmap.goals)
            .selectinload(Goal.cards),
            selectinload(Roadmap.goals)
            .selectinload(Goal.sub_goals)  # Load subgoals
            .selectinload(Goal.cards),     # Load cards for subgoals
            
            # Load boards with lists, cards, and card goals
            selectinload(Roadmap.boards)
            .selectinload(Board.lists)
            .selectinload(BoardList.cards)
            .selectinload(Card.goal),      # Load goal for each card
        )
    ).unique().one()
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    if roadmap.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return RoadmapDisplay.from_roadmap(roadmap, session)

@router.get("/users/{user_id}/public-roadmaps", response_model=List[RoadmapPublic])
def get_public_roadmaps_by_user(
    user_id: int,
    session: SessionDep
):
    """Get users public roadmaps"""
    roadmaps = session.exec(
        select(Roadmap).where(
            Roadmap.owner_id == user_id,
            Roadmap.visibility == RoadmapVisibility.PUBLIC
        )
    ).all()
    return roadmaps

@router.patch("/roadmaps/{roadmap_id}", response_model=RoadmapPublic)
def update_roadmap(
    roadmap_id: int,
    roadmap_in: RoadmapUpdate,
    session: SessionDep,
    current_user: CurrentUser    
):
    roadmap = session.get(Roadmap, roadmap_id)
    
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    if roadmap.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this roadmap")

    update_dict = roadmap_in.dict(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(roadmap, field, value)
    
    session.add(roadmap)
    session.commit()
    session.refresh(roadmap)
    
    return roadmap


@router.get("/", response_model=dict)
def read_goals(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    roadmap_id: Optional[int] = None,
) -> List[Goal]:
    """Read user's goals, optionally filtered by roadmap"""
    query = select(Goal).where(Goal.owner_id == current_user.id)

    if roadmap_id:
        query = query.where(Goal.roadmap_id == roadmap_id)

    goals = session.exec(query.offset(skip).limit(limit)).all()
    total = session.exec(select(func.count()).select_from(query.subquery())).one()

    return {"goals": goals, "total": total}


@router.patch("/{goal_id}", response_model=Goal)
def update_goal(
    *, session: SessionDep, current_user: CurrentUser, goal_id: int, goal_in: GoalUpdate
) -> Goal:
    """Update a goal"""
    goal = session.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = goal_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)

    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal


@router.delete("/{goal_id}")
def delete_goal(session: SessionDep, current_user: CurrentUser, goal_id: int) -> dict:
    """Delete a goal"""
    goal = session.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    session.delete(goal)
    session.commit()
    return {"ok": True}


# ============================== LLM Goal Generation ==============================
@router.post("/generate", response_model=TaskStatus)
async def generate_goals(
    *,
    # request: Request, // NOTE: For Client IP/headers if needed
    llm_request: LLMGenerationRequest,
    current_user: CurrentUser,
) -> TaskStatus:
    """
    Generate multiple AI-curated goal options with automatic safety checks.
    Returns LLMGenerationResponse which may contain RoadmapDisplay in its output.
    """
    # For asynchronous processing with celery
    task = process_llm_generation.delay(
        llm_request_json=json.dumps(llm_request.model_dump()),
        user_id=current_user.id,
    )

    return TaskStatus(
        task_id=task.id,
        status=TaskStatusEnum.PROCESSING,
        message="Your request is being processed."
    )



@router.post("/confrim_progressive_update", response_model=TaskStatus)
async def confirm_progressive_update(
    *,
    proposal: ProgressiveUpdateProposal,
    current_user: CurrentUser,
) -> Goal:
    """Confirm and apply a progressive update path"""
    # validate the proposal
    task = process_progressive_update.delay(
        proposal_json=json.dumps(proposal.model_dump()), 
        user_id=current_user.id
    )

    return TaskStatus(
        task_id=task.id,
        status=TaskStatusEnum.PROCESSING,
        message="Your progressive update proposal is being processed."
    )



@router.get("/task/{task_id}", response_model=TaskStatus)
async def check_task_status(
    task_id: str, 
    session: SessionDep,
    background_tasks: BackgroundTasks
) -> TaskStatus:
    """
    Check the status of an async LLM generation task.
    """
    task_result = celery_app.AsyncResult(task_id)

    if task_result.state == "PENDING":
        return TaskStatus(task_id=task_id, status=TaskStatusEnum.PROCESSING)

    if task_result.state == "FAILURE":
        return TaskStatus(
            task_id=task_id,
            status=TaskStatusEnum.FAILED,
            message=str(task_result.result)
        )

    if task_result.state == "SUCCESS":
        result = task_result.result

        if not result or not isinstance(result, dict):
            return TaskStatus(
                task_id=task_id,
                status=TaskStatusEnum.FAILED,
                message="Malformed result from task"
            )

        if result.get("status") == "success":
            roadmap_id = result.get("goal_id")  # Assuming roadmap is linked to the goal

            if roadmap_id:
                roadmap = session.get(Roadmap, roadmap_id)
                if roadmap:
                    roadmap_display = RoadmapDisplay.from_roadmap(roadmap)
                    # Inject this display info directly into result
                    result["roadmap_display"] = roadmap_display.dict()

            return TaskStatus(
                task_id=task_id,
                status=TaskStatusEnum.COMPLETED,
                result=LLMGenerationResponse(**{
                    "output": {
                        "creations": {},
                        "roadmap_display": result.get("roadmap_display"),
                    }
                }).to_public()
            )


    return TaskStatus(task_id=task_id, status=TaskStatusEnum.PROCESSING)