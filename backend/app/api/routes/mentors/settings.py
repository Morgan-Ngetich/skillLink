from fastapi import APIRouter
from app.api.deps import SessionDep, CurrentUser
from app.models import (
    MentorSettingsPublic,
    MentorSettingsUpdate,
)
from app import crud

router = APIRouter()


@router.get("/settings", response_model=MentorSettingsPublic)
def get_my_settings(session: SessionDep, current_user: CurrentUser):
    """Get current mentor's settings"""
    settings = crud.get_mentor_settings_or_404(session, current_user.id)
    return settings.to_public()


@router.patch("/settings", response_model=MentorSettingsPublic)
def update_my_settings(
    settings_in: MentorSettingsUpdate,
    session: SessionDep,
    current_user: CurrentUser
):
    """Update current mentor's settings"""
    settings = crud.update_mentor_settings(
        session,
        current_user.id,
        settings_in
    )
    return settings.to_public()