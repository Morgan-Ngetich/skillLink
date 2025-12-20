from fastapi import APIRouter
from app.api.deps import SessionDep, CurrentUser
from app.models import MentorStatsPublic
from app import crud

router = APIRouter()


@router.get("/stats", response_model=MentorStatsPublic)
def get_stats(session: SessionDep, current_user: CurrentUser):
    """Get comprehensive mentor statistics"""
    stats = crud.get_mentor_stats(session, current_user.id)
    return MentorStatsPublic(**stats).model_dump()


@router.post("/stats/refresh", response_model=dict, status_code=200)
def refresh_stats(session: SessionDep, current_user: CurrentUser):
    """Manually refresh cached stats"""
    profile = crud.update_mentor_cached_stats(session, current_user.id)
    
    return {
        "message": "Stats refreshed successfully",
        "total_sessions": profile.total_sessions,
        "total_mentees": profile.total_mentees,
    }
