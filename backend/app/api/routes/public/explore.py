from fastapi import APIRouter, Query
from typing import Optional, List
from datetime import datetime
from app.api.deps import SessionDep
from app.models import (
    UserPublic,
    MentorSessionPublic,
    MentorServicePublic,
    MentorExplorePublic,
    LocationType,
)
from app import crud

router = APIRouter()


@router.get("/mentors", response_model=List[MentorExplorePublic])
def browse_mentors(
    session: SessionDep,
    expertise: Optional[str] = Query(None, description="Filter by expertise"),
    available: Optional[bool] = Query(None, description="Only mentors open to mentees"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """
    Browse mentors for explore page.
    - Returns lightweight public info optimized for listing.
    """

    users = crud.list_public_mentors(
        session=session,
        expertise=expertise,
        available=available,
        limit=limit,
        offset=offset,
    )

    # Convert safely to explore model, skip non-mentors or incomplete profiles
    mentors = [u.to_explore_mentor_public() for u in users]
    mentors = [m for m in mentors if m is not None]

    return mentors


@router.get("/sessions", response_model=List[MentorSessionPublic])
def browse_sessions(
    session: SessionDep,
    session_type: Optional[str] = Query(None),
    location_type: Optional[LocationType] = Query(None),
    tag: Optional[str] = Query(None),
    mentor_expertise: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    min_duration: Optional[int] = Query(None, ge=15),
    max_duration: Optional[int] = Query(None, ge=15),
    from_time: Optional[datetime] = Query(None),
    to_time: Optional[datetime] = Query(None),
    only_available: bool = Query(False),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    sessions = crud.list_public_sessions(
        session=session,
        session_type=session_type,
        location_type=location_type,
        tag=tag,
        mentor_expertise=mentor_expertise,
        min_price=min_price,
        max_price=max_price,
        min_duration=min_duration,
        max_duration=max_duration,
        from_time=from_time,
        to_time=to_time,
        only_available=only_available,
        limit=limit,
        offset=offset,
    )
    return [s.to_public(current_user_id=None) for s in sessions]



@router.get("/services", response_model=List[MentorServicePublic])
def browse_services(
    session: SessionDep,
    category: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    services = crud.list_public_services(
        session=session,
        category=category,
        min_price=min_price,
        max_price=max_price,
        limit=limit,
        offset=offset,
    )
    return [s.to_public() for s in services]

