from fastapi import APIRouter, Query
from uuid import UUID
from typing import List
from app.api.deps import SessionDep, CurrentUser
from app.models import (
    MentorExplorePublic,
)
from app import crud

router = APIRouter()

@router.get("/mentors/also-viewed", response_model=List[MentorExplorePublic])
def people_also_viewed(
    currentUser: CurrentUser,
    session: SessionDep,
    limit: int = Query(6, ge=1, le=10),
):
    """
    Returns random mentors excluding the current profile.
    TODO: Simple random selection for now — evolve to tag-based later.
    """
    users = crud.get_also_viewed_mentors(
        session=session,
        exclude_mentor_uuid=currentUser.uuid,
        limit=limit,
    )

    mentors = [u.to_explore_mentor_public() for u in users]
    mentors = [m for m in mentors if m is not None]

    return mentors