from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from sqlmodel import select
from sqlalchemy import func
from app.models.users import User, UserPublic, UsersPublic, UserCreate
from app.api.deps import CurrentUser, get_current_active_superuser, SessionDep
from app import crud

router = APIRouter()


@router.get(
    "/",
    dependencies=[Depends(get_current_active_superuser)],
    response_model=UsersPublic,
)
def read_users(session: SessionDep, skip: int = 0, limit: int = 100) -> Any:
    """
    Retrieve users.
    """

    count_statement = select(func.count()).select_from(User)
    count = session.exec(count_statement).one()

    statement = select(User).offset(skip).limit(limit)
    users = session.exec(statement).all()

    return UsersPublic(data=[user.to_public() for user in users], count=count)


# ✅ GET /me — authenticated user (JWT or Supabase)
@router.get("/me", response_model=UserPublic)
def get_me(current_user: CurrentUser) -> UserPublic:
    """
    Get current active user
    """
    return current_user.to_public()


# ✅ POST / — create a new user (admin-only/manual password auth)
@router.post(
    "/", response_model=UserPublic, dependencies=[Depends(get_current_active_superuser)]
)
def create_user(session: SessionDep, user_in: UserCreate) -> Any:
    """
    Create a new User
    """
    existing_user = crud.get_user_by_email(session=session, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = crud.create_user(session, user_in)
    return user.to_public()
