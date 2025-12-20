import json
from fastapi import APIRouter, BackgroundTasks
from app.api.deps import CurrentUser, SessionDep
from app.models import (
    GoalCreationRequest,
    LLMGenerationRequest,
    LLMGenerationResponse,
    LLMTargetEntity,
    ProgressiveUpdateProposal,
    TaskStatus,
    TaskStatusEnum,
    Goal,
    Roadmap,
    RoadmapDisplay,
)
from app.tasks.llm_tasks import (
    process_llm_generation,
    process_progressive_update,
)
from app.utils.llm_service import build_goal_context
from app.core.celery import celery_app

router = APIRouter()


@router.post("/", response_model=dict)
def create_goal(
    session: SessionDep,
    current_user: CurrentUser,
    goal_in: GoalCreationRequest
) -> dict:
    """Create goal with optional AI-generated plan"""
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
                    "start_date": (
                        goal.start_date.isoformat()
                        if goal.start_date else None
                    ),
                    "end_date": (
                        goal.target_date.isoformat()
                        if goal.target_date else None
                    )
                }
            },
            target_entities=[
                LLMTargetEntity.ROADMAPS,
                LLMTargetEntity.CARDS
            ],
            **(goal_in.ai_settings or {})
        )
        
        task = process_llm_generation.delay(
            llm_request_json=json.dumps(llm_request.model_dump()),
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


@router.post("/generate", response_model=TaskStatus)
async def generate_goals(
    llm_request: LLMGenerationRequest,
    current_user: CurrentUser
) -> TaskStatus:
    """Generate AI-curated goal options"""
    task = process_llm_generation.delay(
        llm_request_json=json.dumps(llm_request.model_dump()),
        user_id=current_user.id,
    )
    
    return TaskStatus(
        task_id=task.id,
        status=TaskStatusEnum.PROCESSING,
        message="Your request is being processed."
    )


@router.post("/confirm_progressive_update", response_model=TaskStatus)
async def confirm_progressive_update(
    proposal: ProgressiveUpdateProposal,
    current_user: CurrentUser
) -> TaskStatus:
    """Confirm and apply progressive update path"""
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
    """Check async LLM task status"""
    task_result = celery_app.AsyncResult(task_id)
    
    if task_result.state == "PENDING":
        return TaskStatus(
            task_id=task_id,
            status=TaskStatusEnum.PROCESSING
        )
    
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
            roadmap_id = result.get("goal_id")
            
            if roadmap_id:
                roadmap = session.get(Roadmap, roadmap_id)
                if roadmap:
                    roadmap_display = RoadmapDisplay.from_roadmap(roadmap)
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