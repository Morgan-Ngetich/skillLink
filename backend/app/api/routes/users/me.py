from fastapi import APIRouter
from app.api.deps import CurrentUser, SessionDep
from app.models import UserPublic, UserUpdate
from app import crud

router = APIRouter()


@router.get("/me", response_model=UserPublic)
def get_me(current_user: CurrentUser) -> UserPublic:
    """Get current authenticated user"""
    return current_user.to_public()


@router.patch("/me", response_model=UserPublic)
def update_me(
    session: SessionDep,
    current_user: CurrentUser,
    user_in: UserUpdate
) -> UserPublic:
    """Update current user's information"""
    updated_user = crud.update_user(session, current_user, user_in)
    return updated_user.to_public()