from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import SessionDep, CurrentUser
from sqlmodel import select
from app.models.users import (
    Role,
    UserRole,
    RoleName,
    UserProfilePublic,
    UserProfileCreate,
    UserProfileUpdate,
    MentorProfileCreate,
    MentorProfilePublic,
    MentorProfileUpdate,
    MentorSettingsCreate,
    MentorSessionPublic,
    MentorSessionCreate,
    MentorSessionUpdate,
    MentorServicePublic,
    MentorServiceCreate,
    MentorServiceUpdate,
    MentorSettingsPublic, 
    MentorSettingsUpdate,
    MentorProfile,
    MentorSettings
    
)
from app import crud

router = APIRouter()

# ================= MENTOR ==================
@router.get("/mentor", response_model=MentorProfilePublic)
def read_my_mentor_profile(current_user: CurrentUser, session: SessionDep):
    """
    Retrieve CurrentUser's mentor's profile
    """
    profile = crud.get_mentor_profile_or_404(session, current_user.id)
    return profile.to_public()

@router.get("/mentor/{user_id}", response_model=MentorProfilePublic)
def read_user_mentor_profile(user_id: int, session: SessionDep):
    """
    Retrieve a user's mentor profile by user_id (admin/public usage)
    """
    profile = crud.get_mentor_profile_or_404(session, user_id)
    return profile.to_public()
  
@router.post("/mentor", response_model=MentorProfilePublic)
def create_mentor_profile(profile_in: MentorProfileCreate, session: SessionDep, current_user: CurrentUser):
    """
    Create mentor profile - 1-step onboarding
    This endpoint is caled after user completes mentor setup
    """
    if profile_in.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot create mentor profile for another user")
    
    # Chekc is user profile is complete
    user_profile = crud.get_user_profile_or_404(session, current_user.id)
    if not user_profile.is_profile_setup_complete:
        raise HTTPException(status_code=400, detail="Complete user profile setup before creating mentor profile")
    
    # Create mentor profile
    profile = crud.create_mentor_profile(session, profile_in)      
    
    # Create default mentor settings
    settings_in = MentorSettingsCreate(mentor_id=current_user.id)
    crud.create_mentor_settings(session, settings_in)
    
    # Assign MENTOR role
    crud.assign_role(session, current_user, RoleName.MENTOR)   
    return profile.to_public()

@router.delete("/mentor/{user_id}", status_code=204)
def delete_mentor_profile(
    user_id: int,
    session: SessionDep,
    current_user: CurrentUser,
):
    """
    Delete a mentor profile by user_id.
    - Admins can delete any mentor profile.
    - Regular users can only delete their own.
    Also removes related mentor settings and unassigns the MENTOR role.
    """
    # Check permission
    if not current_user.is_superuser and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this mentor profile")

    # Check if mentor profile exists
    mentor_profile = session.exec(
        select(MentorProfile).where(MentorProfile.user_id == user_id)
    ).first()

    if not mentor_profile:
        raise HTTPException(status_code=404, detail="Mentor profile not found")

    # Delete mentor settings
    mentor_settings = session.exec(
        select(MentorSettings).where(MentorSettings.mentor_id == user_id)
    ).first()
    if mentor_settings:
        session.delete(mentor_settings)

    # Delete mentor profile
    session.delete(mentor_profile)
    session.commit()

    # Remove mentor role if exists
    mentor_role = session.exec(
        select(Role).where(Role.name == RoleName.MENTOR.value)
    ).first()
    if mentor_role:
        user_role = session.exec(
            select(UserRole).where(
                UserRole.user_id == user_id,
                UserRole.role_id == mentor_role.id
            )
        ).first()
        if user_role:
            session.delete(user_role)
            session.commit()

    return {"detail": "Mentor profile deleted successfully"}


@router.patch("/mentor", response_model=MentorProfilePublic)
def update_mentor_profile(profile_in: MentorProfileUpdate, session: SessionDep, current_user: CurrentUser):
    """ Update CurrentUser's mentor profile """
    profile = crud.update_mentor_profile(session, current_user.id, profile_in)
    return profile.to_public()

  
@router.get("/mentor/stats", response_model=dict)
def get_mentor_stats(session: SessionDep, current_user: CurrentUser):
    """
    Get mentor statistics
    """
    profile = crud.get_mentor_profile_or_404(session, current_user.id)
    
    return {
        "total_sessions": profile.total_sessions,
        "total_mentees": profile.total_mentees,
        "average_rating": profile.average_rating,
        "completion_percentage": profile.completion_percentage,
        "is_complete": profile.is_mentor_profile_complete,
    }
    

# MENTOR SESSION
@router.post("/mentor/sessions", response_model=MentorSessionPublic, status_code=201)
def create_mentor_session(
    session_in: MentorSessionCreate,
    session: SessionDep,
    current_user: CurrentUser
):
    """Create a new bookable session type"""
    if session_in.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot create session for another mentor")
    
    crud.get_mentor_profile_or_404(session, current_user.id)
    mentor_session = crud.create_mentor_session(session, session_in)
    return mentor_session.to_public()


@router.get("/mentor/sessions", response_model=list[MentorSessionPublic])
def list_my_mentor_sessions(session: SessionDep, current_user: CurrentUser):
    """List all sessions for current mentor"""
    sessions = crud.get_all_mentor_sessions(session, current_user.id)
    return [s.to_public() for s in sessions]


@router.patch("/mentor/session/{session_id}", response_model=MentorSessionPublic)
def update_mentor_session(
    session_id: int,
    session_in: MentorSessionUpdate,
    session: SessionDep,
    current_user: CurrentUser
):
    """Update a mentor session"""
    mentor_session = crud.get_mentor_session_or_404(session, session_id)
    if mentor_session.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this session")

    updated = crud.update_mentor_session(session, session_id, session_in)
    return updated.to_public()


@router.delete("/mentor/sessions/{session_id}", status_code=204)
def delete_mentor_session(
    session_id: int,
    session: SessionDep,
    current_user: CurrentUser
):
    """Delete a mentor session"""
    mentor_session = crud.get_mentor_session_or_404(session, session_id)
    if mentor_session.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this session")

    crud.delete_mentor_session(session, session_id)
    return None

    
# USER's PROFILE
@router.get("/completion-status", response_model=dict)
def get_profile_completion_status(session: SessionDep, current_user: CurrentUser):
    """ Get detailed profile completion status with missing fields """
    profile = crud.get_user_profile_or_404(session, current_user.id)
    
    missing_fields = []
    if not profile.title:
        missing_fields.append({"field": "title", "label": "Add a title", "step": "basic"})
    if not profile.about:
        missing_fields.append({"field": "about", "label": "Add an about", "step": "basic"})
    if not profile.location:
        missing_fields.append({"field": "location", "label": "Set your location", "step": "basic"})
    if not profile.experience or len(profile.experience) == 0:
        missing_fields.append({"field": "experience", "label": "Add work experience", "step": "experience"})
    if not profile.education or len(profile.education) == 0:
        missing_fields.append({"field": "education", "label": "Add education", "step": "education"})
    if not profile.skills or len(profile.skills) < 3:
        missing_fields.append({"field": "skills", "label": "List your skills (at least 3)", "step": "skills"})
    if not profile.interests or len(profile.interests) == 0:
        missing_fields.append({"field": "interests", "label": "Share your interests", "step": "skills"})
    if not profile.social_links or not (profile.social_links.get("linkedin") or profile.social_links.get("github")):
        missing_fields.append({"field": "social", "label": "Connect social profiles", "step": "social"})

    completed_count = 7 - len(missing_fields)
    completion_percentage = int((completed_count / 7) * 100)
    
    return {
        "is_complete": profile.is_profile_complete,
        "is_setup_complete": profile.is_profile_setup_complete,
        "completion_percentage": completion_percentage,
        "missing_fields": missing_fields,
        "completed_count": completed_count,
        "total_fields": 7,
    }

# ============= USER PROFILE ==============
@router.get("/", response_model=UserProfilePublic)
def read_my_profile(session: SessionDep, current_user: CurrentUser):
    """
    Retrieve CurrentUser's profile
    """
    profile = crud.get_user_profile_or_404(session, current_user.id)
    return profile.to_public()

@router.get("/{user_id}", response_model=UserProfilePublic)
def read_user_profile(user_id: int, session: SessionDep):
    """
    Retrieve a user's profile by user_id (admin/public usage)
    """
    profile = crud.get_user_profile_or_404(session, user_id)
    return profile.to_public()

@router.post("/", response_model=UserProfilePublic)
def create_profile(session: SessionDep, profile_in: UserProfileCreate, current_user: CurrentUser):
    """
    Create user's Profile and assign MENTEE role
    """

    profile = crud.create_user_profile(session, profile_in, user_id=current_user.id)
    
    # Assign MENTEE role
    crud.assign_role(session, current_user, RoleName.MENTEE)
    
    return profile.to_public()

@router.patch("/", response_model=UserProfilePublic)
def update_profile(session: SessionDep, profile_in: UserProfileUpdate , current_user: CurrentUser):
    """
    Update CurrentUser's Profile
    """
    try:
        profile = crud.update_user_profile(session, current_user.id, profile_in)
        return profile.to_public()
    except ValueError:
        raise HTTPException(status_code=404, detail="Profile not found")

@router.patch("/{id}", response_model=UserProfilePublic)
def update_profile_by_id(id: int, session: SessionDep, profile_in: UserProfileUpdate , current_user: CurrentUser):
    """
    Update a user's Profile by id (admin usage)
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        profile = crud.update_user_profile(session, id, profile_in)
        return profile.to_public()
    except ValueError:
        raise HTTPException(status_code=404, detail="Profile not found")
    

# MENTOR SERVICES
@router.post("/mentor/services", response_model=MentorServicePublic, status_code=201)
def create_mentor_service(
    service_in: MentorServiceCreate,
    session: SessionDep,
    current_user: CurrentUser
):
    """Create a new service showcase card"""
    if service_in.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot create service for another mentor")

    crud.get_mentor_profile_or_404(session, current_user.id)
    service = crud.create_mentor_service(session, service_in)
    return service.to_public()


@router.get("/mentor/services", response_model=list[MentorServicePublic])
def list_my_mentor_services(session: SessionDep, current_user: CurrentUser):
    """List all services for current mentor"""
    services = crud.get_all_mentor_services(session, current_user.id)
    return [s.to_public() for s in services]

@router.get("/mentor/{user_id}/services", response_model=list[MentorServicePublic])
def list_user_mentor_services(user_id: int, session: SessionDep):
    """Public: list all active services for a specific mentor"""
    services = crud.get_all_mentor_services(session, user_id, active_only=True)
    return [s.to_public() for s in services]

@router.patch("/mentor/services/{service_id}", response_model=MentorServicePublic)
def update_mentor_service(
    service_id: int,
    service_in: MentorServiceUpdate,
    session: SessionDep,
    current_user: CurrentUser
):
    """Update a mentor service"""
    service = crud.get_mentor_service_or_404(session, service_id)
    if service.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this service")

    updated = crud.update_mentor_service(session, service_id, service_in)
    return updated.to_public()


@router.delete("/mentor/services/{service_id}", status_code=204)
def delete_mentor_service(
    service_id: int,
    session: SessionDep,
    current_user: CurrentUser
):
    """Delete a mentor service"""
    service = crud.get_mentor_service_or_404(session, service_id)
    if service.mentor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this service")

    crud.delete_mentor_service(session, service_id)
    return None



# SETTINGS
@router.get("/mentor/settings", response_model=MentorSettingsPublic)
def get_my_mentor_settings(session: SessionDep, current_user: CurrentUser):
    """Retrieve current mentor's settings"""
    settings = crud.get_mentor_settings_or_404(session, current_user.id)
    return settings.to_public()


@router.patch("/mentor/settings", response_model=MentorSettingsPublic)
def update_my_mentor_settings(
    settings_in: MentorSettingsUpdate,
    session: SessionDep,
    current_user: CurrentUser
):
    """Update current mentor's settings"""
    settings = crud.update_mentor_settings(session, current_user.id, settings_in)
    return settings.to_public()

@router.post("/mentor/toggle-availability", response_model=MentorProfilePublic)
def toggle_mentor_availability(session: SessionDep, current_user: CurrentUser):
    """
    Toggle mentor's availability (open to mentees on/off)
    Quick toggle endpoint used in mentor dashboard
    """
    settings = crud.get_mentor_settings_or_404(session, current_user.id)
    settings.currently_open_to_mentees = not settings.currently_open_to_mentees

    session.add(settings)
    session.commit()
    session.refresh(settings)

    profile = crud.get_mentor_profile_or_404(session, current_user.id)
    return profile.to_public()