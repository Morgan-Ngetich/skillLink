from typing import List, Dict
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload


def calculate_roadmap_progress(session: Session, roadmap_id: int) -> Dict[str, object]:
    """
    Calculate progress for a specific roadmap.
    Includes goal-level breakdown.
    """
    from app.models.users import Goal  # lazy import

    goals: List[Goal] = session.exec(
        select(Goal)
        .where(Goal.roadmap_id == roadmap_id)
        .options(
            selectinload(Goal.sub_goals),
            selectinload(Goal.cards),
        )
    ).all()

    goal_progress_list = []
    for goal in goals:
        progress = calculate_goal_progress(goal)
        goal_progress_list.append({
            "goal_id": goal.id,
            "title": goal.title,
            "progress": progress,
            "status": goal.status.value,
        })

    total_progress = (
        sum(g["progress"] for g in goal_progress_list) / len(goal_progress_list)
        if goal_progress_list else 0.0
    )

    return {
        "roadmap_id": roadmap_id,
        "total_goals": len(goals),
        "completion_percentage": total_progress,
        "goals": goal_progress_list
    }


def calculate_goal_progress(goal) -> float:
    """
    Calculate completion percentage for a single goal.
    Returns a float between 0.0 and 1.0
    """
    from app.models.users import GoalStatus, CardStatus  # lazy import

    if goal.sub_goals:
        total = len(goal.sub_goals)
        if total == 0:
            return 0.0
        completed = sum(
            1 for g in goal.sub_goals
            if g.status == GoalStatus.COMPLETED
        )
        return completed / total

    if goal.cards:
        total = len(goal.cards)
        if total == 0:
            return 0.0
        completed = sum(
            1 for c in goal.cards
            if c.status == CardStatus.DONE
        )
        return completed / total

    # Fallback based on status
    status_weights = {
        GoalStatus.NOT_STARTED: 0.0,
        GoalStatus.IN_PROGRESS: 0.3,
        GoalStatus.BLOCKED: 0.1,
        GoalStatus.COMPLETED: 1.0,
    }
    return status_weights.get(goal.status, 0.0)


def calculate_user_progress(session: Session, user_id: int) -> Dict[str, object]:
    """
    Calculate user's overall goal progress.
    Returns progress details including breakdown by goal type.
    """
    from app.models.users import Goal, GoalStatus, GoalType  # lazy import

    goals: List[Goal] = session.exec(
        select(Goal)
        .where(Goal.owner_id == user_id)
        .options(
            selectinload(Goal.sub_goals),
            selectinload(Goal.cards),
        )
    ).all()

    if not goals:
        return {
            "total_goals": 0,
            "completed_goals": 0,
            "completion_percentage": 0.0,
            "by_type": {}
        }

    total_goals = len(goals)
    completed_goals = sum(1 for g in goals if g.status == GoalStatus.COMPLETED)

    # Progress by type
    by_type: Dict[str, float] = {}
    for goal_type in GoalType:
        typed_goals = [g for g in goals if g.type == goal_type]
        if not typed_goals:
            continue
        progress_sum = sum(calculate_goal_progress(g) for g in typed_goals)
        by_type[goal_type.value] = progress_sum / len(typed_goals)

    return {
        "total_goals": total_goals,
        "completed_goals": completed_goals,
        "completion_percentage": completed_goals / total_goals,
        "by_type": by_type
    }
