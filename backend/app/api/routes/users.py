from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from sqlmodel import select
from app.models.users import User, UserPublic, UserCreate
from app.api.deps import CurrentUser, get_current_active_superuser, SessionDep
from app import crud

router = APIRouter()

# ✅ GET /me — authenticated user (JWT or Supabase)
@router.get("/me", response_model=UserPublic)
def get_me(current_user: CurrentUser) -> UserPublic:
    return current_user.to_public()


# ✅ POST / — create a new user (admin-only/manual password auth)
@router.post("/", response_model=UserPublic, dependencies=[Depends(get_current_active_superuser)])
def create_user(session: SessionDep, user_in: UserCreate) -> Any:
    existing_user = crud.get_user_by_email(session, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = crud.create_user(session, user_in)
    return user.to_public()
