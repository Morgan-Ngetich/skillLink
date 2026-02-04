from fastapi import APIRouter, HTTPException, Depends
from app.api.deps import CurrentUserOptional, SessionDep, CurrentUser, require_role
from app.models import UserProfilePublic, UserProfileUpdate, RoleName
from app import crud

router = APIRouter()


@router.get("/{user_id}", response_model=UserProfilePublic)
def get_user_profile(
    user_id: int, 
    session: SessionDep,
    current_user: CurrentUserOptional = None
    ):
    """Get user profile by ID (public)"""
    profile = crud.get_user_profile_or_404(session, user_id)
    return profile.to_public(current_user_id=current_user.id if current_user else None)

@router.patch(
    "/{user_id}",
    response_model=UserProfilePublic,
    dependencies=[Depends(require_role(RoleName.SUPERUSER))]
)
def update_user_profile(
    user_id: int,
    session: SessionDep,
    profile_in: UserProfileUpdate
):
    """Update user profile by ID (admin only)"""
    try:
        profile = crud.update_user_profile(session, user_id, profile_in)
        return profile.to_public()
    except ValueError:
        raise HTTPException(status_code=404, detail="Profile not found")
