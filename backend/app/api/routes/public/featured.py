from fastapi import APIRouter
from typing import List
from app.api.deps import SessionDep
from app.models import (
    MentorExplorePublic,
    MentorSessionPublic,
    MentorServicePublic,
)
from app import crud

router = APIRouter()


@router.get("/featured/mentors", response_model=List[MentorExplorePublic])
def get_featured_mentors(session: SessionDep):
    """Get featured mentors"""
    mentors = crud.get_featured_mentors(session=session, limit=20)
    
    # Convert safely to explore model, skip non-mentors or incomplete profiles
    featured_mentors = [u.to_explore_mentor_public() for u in mentors]
    featured_mentors = [m for m in featured_mentors if m is not None]

    return featured_mentors


@router.get("/featured/sessions", response_model=List[MentorSessionPublic])
def get_featured_sessions(session: SessionDep):
    """Get featured sessions"""
    sessions = crud.get_featrued_sessions(session=session, limit=20)
    return [s.to_public() for s in sessions]


@router.get("/featured/services", response_model=List[MentorServicePublic])
def get_featured_services(session: SessionDep):
    """Get featured services"""
    services = crud.get_featured_services(session=session, limit=20)
    return [s.to_public() for s in services]