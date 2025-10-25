from fastapi import APIRouter, HTTPException
from app.api.deps import SessionDep, CurrentUser
from app.models.users import (
    UserProfilePublic,
    UserProfileCreate,
    UserProfileUpdate,
    RoleName,
)
from app import crud

router = APIRouter()

# ============= USER PROFILE ==============
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


@router.get("/me", response_model=UserProfilePublic)
def read_my_profile(session: SessionDep, current_user: CurrentUser):
    """
    Retrieve CurrentUser's profile
    """
    profile = crud.get_user_profile_or_404(session, current_user.id)
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
def update_profile(session: SessionDep, profile_in: UserProfileUpdate, current_user: CurrentUser):
    """
    Update CurrentUser's Profile
    """
    try:
        profile = crud.update_user_profile(session, current_user.id, profile_in)
        return profile.to_public()
    except ValueError:
        raise HTTPException(status_code=404, detail="Profile not found")


# ADMIN ROUTES - Must come after specific routes
@router.get("/{user_id}", response_model=UserProfilePublic)
def read_user_profile(user_id: int, session: SessionDep):
    """
    Retrieve a user's profile by user_id (admin/public usage)
    """
    profile = crud.get_user_profile_or_404(session, user_id)
    return profile.to_public()


@router.patch("/{user_id}", response_model=UserProfilePublic)
def update_profile_by_id(user_id: int, session: SessionDep, profile_in: UserProfileUpdate, current_user: CurrentUser):
    """
    Update a user's Profile by id (admin usage)
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    try:
        profile = crud.update_user_profile(session, user_id, profile_in)
        return profile.to_public()
    except ValueError:
        raise HTTPException(status_code=404, detail="Profile not found")