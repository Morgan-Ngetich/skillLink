import json
from fastapi import APIRouter, HTTPException
from sqlmodel import select
from sqlalchemy import func
from typing import List, Optional
from app.api.deps import CurrentUser, SessionDep
from app.core.celery import celery_app
from app.models.users import (
    Goal,
    GoalCreate,
    GoalUpdate,
    LLMGenerationRequest,
    LLMGenerationResponse,
    LLMTargetEntity,
    ProgressiveUpdateProposal,
    RoadmapDisplay,
    Roadmap,
    GoalCreationRequest,
    TaskStatus,
    TaskStatusEnum
)
from app.tasks.llm_tasks import (
    process_llm_generation,
    process_progressive_update,
    process_goal_completion,
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


router.get("/", response_model=List[Goal])
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
async def check_task_status(task_id: str, session: SessionDep) -> TaskStatus:
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

        # Optional: Attach roadmap_display if it exists
        if result.get("status") == "success":
            roadmap = session.get(
                Roadmap, 
                result["response"]["output"]["creations"]["roadmaps"][0]["id"]
            )
            if roadmap:
                roadmap_display = RoadmapDisplay.from_roadmap(roadmap)
                result["response"]["output"]["roadmap_display"] = roadmap_display.dict()

        return TaskStatus(
            task_id=task_id,
            status=TaskStatusEnum.COMPLETED,
            result=LLMGenerationResponse(**result["response"]).to_public()
        )

    return TaskStatus(task_id=task_id, status=TaskStatusEnum.PROCESSING)