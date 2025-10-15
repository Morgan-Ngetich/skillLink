from fastapi import APIRouter, Depends, HTTPException
from app.api.deps import SessionDep, CurrentUser
from app.models.users import (
    RoleName,
    UserProfilePublic,
    UserProfileCreate,
    UserProfileUpdate,
    MentorProfileCreate,
    MentorProfilePublic,
    MentorProfileUpdate,
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
    Create mentor profile and assign MENTOR role
    """
    if profile_in.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot create mentor profile for another user")
    
    profile = crud.create_mentor_profile(session, profile_in)      
    
    # Assign MENTOR role
    crud.assign_role(session, current_user, RoleName.MENTOR)   
    return profile.to_public()

@router.patch("/mentor", response_model=MentorProfilePublic)
def update_mentor_profile(profile_in: MentorProfileUpdate, session: SessionDep, current_user: CurrentUser):
    try:
        profile = crud.update_mentor_profile(session, current_user.id, profile_in)
        return profile.to_public()
    except ValueError:
        raise HTTPException(status_code=404, detail="Mentor profile not found")
    
    
    
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