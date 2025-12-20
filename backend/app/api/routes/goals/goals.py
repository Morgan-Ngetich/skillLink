from fastapi import APIRouter, HTTPException
from typing import List, Optional
from sqlmodel import select
from sqlalchemy import func
from app.api.deps import SessionDep, CurrentUser
from app.models import Goal, GoalUpdate
from app import crud

router = APIRouter()


@router.get("/", response_model=dict)
def list_goals(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    roadmap_id: Optional[int] = None
) -> dict:
    """List user's goals, optionally filtered by roadmap"""
    query = select(Goal).where(Goal.owner_id == current_user.id)
    
    if roadmap_id:
        query = query.where(Goal.roadmap_id == roadmap_id)
    
    goals = session.exec(query.offset(skip).limit(limit)).all()
    total = session.exec(
        select(func.count()).select_from(query.subquery())
    ).one()
    
    return {"goals": goals, "total": total}


@router.patch("/{goal_id}", response_model=Goal)
def update_goal(
    session: SessionDep,
    current_user: CurrentUser,
    goal_id: int,
    goal_in: GoalUpdate
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
def delete_goal(
    session: SessionDep,
    current_user: CurrentUser,
    goal_id: int
) -> dict:
    """Delete a goal"""
    goal = session.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    if goal.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    session.delete(goal)
    session.commit()
    return {"ok": True}