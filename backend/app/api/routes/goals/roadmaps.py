from fastapi import APIRouter, HTTPException
from typing import List
from sqlmodel import select
from sqlalchemy.orm import selectinload
from app.api.deps import SessionDep, CurrentUser
from app.models import (
    Roadmap,
    RoadmapPublic,
    RoadmapDisplay,
    RoadmapUpdate,
    RoadmapVisibility,
    Goal,
    Board,
    BoardList,
    Card,
)
from app import crud

router = APIRouter()


@router.get("/roadmaps", response_model=List[RoadmapPublic])
def list_roadmaps(session: SessionDep, current_user: CurrentUser):
    """Get all user's roadmaps"""
    roadmaps = session.exec(
        select(Roadmap).where(Roadmap.owner_id == current_user.id)
    ).all()
    return roadmaps


@router.get("/roadmaps/{roadmap_id}/full", response_model=RoadmapDisplay)
def get_roadmap_full(roadmap_id: int, session: SessionDep, current_user: CurrentUser):
    """Get full roadmap with goals and boards"""
    roadmap = (
        session.exec(
            select(Roadmap)
            .where(Roadmap.id == roadmap_id)
            .options(
                selectinload(Roadmap.goals).selectinload(Goal.cards),
                selectinload(Roadmap.goals)
                .selectinload(Goal.sub_goals)
                .selectinload(Goal.cards),
                selectinload(Roadmap.boards)
                .selectinload(Board.lists)
                .selectinload(BoardList.cards)
                .selectinload(Card.goal),
            )
        )
        .unique()
        .one()
    )

    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    if roadmap.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return RoadmapDisplay.from_roadmap(roadmap, session)


@router.patch("/roadmaps/{roadmap_id}", response_model=RoadmapPublic)
def update_roadmap(
    roadmap_id: int,
    roadmap_in: RoadmapUpdate,
    session: SessionDep,
    current_user: CurrentUser,
):
    """Update roadmap"""
    roadmap = session.get(Roadmap, roadmap_id)

    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    if roadmap.owner_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this roadmap"
        )

    update_dict = roadmap_in.dict(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(roadmap, field, value)

    session.add(roadmap)
    session.commit()
    session.refresh(roadmap)

    return roadmap


@router.get("/users/{user_id}/public-roadmaps", response_model=List[RoadmapPublic])
def get_public_roadmaps(user_id: int, session: SessionDep):
    """Get user's public roadmaps"""
    roadmaps = session.exec(
        select(Roadmap).where(
            Roadmap.owner_id == user_id, Roadmap.visibility == RoadmapVisibility.PUBLIC
        )
    ).all()
    return roadmaps
