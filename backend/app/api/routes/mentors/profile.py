from fastapi import APIRouter, HTTPException
from app.api.deps import SessionDep, CurrentUser
from app.models import (
    MentorProfilePublic,
    MentorProfileCreate,
    MentorProfileUpdate,
    MentorSettingsCreate,
    RoleName,
)
from app import crud

router = APIRouter()


@router.get("/profile", response_model=MentorProfilePublic)
def get_my_mentor_profile(current_user: CurrentUser, session: SessionDep):
    """Get current user's mentor profile"""
    profile = crud.get_mentor_profile_or_404(session, current_user.id)
    return profile.to_public()


@router.post("/profile", response_model=MentorProfilePublic)
def create_mentor_profile(
    profile_in: MentorProfileCreate,
    session: SessionDep,
    current_user: CurrentUser
):
    """Create mentor profile (one-step onboarding)"""
    if profile_in.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Cannot create mentor profile for another user"
        )
    
    # Verify user profile is complete
    user_profile = crud.get_user_profile_or_404(session, current_user.id)
    if not user_profile.is_profile_setup_complete:
        raise HTTPException(
            status_code=400,
            detail="Complete user profile setup before creating mentor profile"
        )
    
    # Create mentor profile
    profile = crud.create_mentor_profile(session, profile_in)
    
    # Create default settings
    settings_in = MentorSettingsCreate(mentor_id=current_user.id)
    crud.create_mentor_settings(session, settings_in)
    
    # Assign MENTOR role
    crud.assign_role(session, current_user, RoleName.MENTOR)
    
    return profile.to_public()


@router.patch("/profile", response_model=MentorProfilePublic)
def update_my_mentor_profile(
    profile_in: MentorProfileUpdate,
    session: SessionDep,
    current_user: CurrentUser
):
    """Update current user's mentor profile"""
    profile = crud.update_mentor_profile(session, current_user.id, profile_in)
    return profile.to_public()


@router.post("/toggle-availability", response_model=MentorProfilePublic)
def toggle_availability(session: SessionDep, current_user: CurrentUser):
    """Toggle mentor availability (open to mentees on/off)"""
    settings = crud.get_mentor_settings_or_404(session, current_user.id)
    settings.currently_open_to_mentees = not settings.currently_open_to_mentees
    
    session.add(settings)
    session.commit()
    session.refresh(settings)
    
    profile = crud.get_mentor_profile_or_404(session, current_user.id)
    return profile.to_public()
