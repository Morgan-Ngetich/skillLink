from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from sqlmodel import select
from sqlalchemy import func
from app.models.users import User, UserPublic, UsersPublic, UserCreate, UserSyncIn
from app.api.deps import CurrentUser, get_current_active_superuser, SessionDep
from app import crud
from uuid import UUID
from app.core.config import settings
from app.tasks.sync import sync_user_from_supabase_task
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


@router.get("/me", response_model=UserPublic)
def get_me(current_user: CurrentUser) -> UserPublic:
    """
    GET /me — authenticated user (JWT or Supabase)
    """
    return current_user.to_public()


@router.get("/users/{user_id}", response_model=UserPublic)
def read_user(session: SessionDep, user_id: int) -> UserPublic:
    """
    Retrieve a user by ID.
    """
    user = crud.get_user_by_id(session=session, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.to_public()


@router.post("/sync", response_model=UserPublic)
def sync_user_from_supabase_to_db(
   user_sync_in: UserSyncIn,
   current_user: CurrentUser
) -> UserPublic:
    """
    Trigger a background task to sync a user from Supabase.
    """
    if current_user.uuid != user_sync_in.user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only sync your own user profile.",
        )
        
    # Trigger a background task
    # Don't pass sesions => not serailizeble
    # Pass UUID as str for Celery serialization
    sync_user_from_supabase_task.delay(
        # user_id is uuid from supabase
        user_id=str(user_sync_in.user_id),
        email=user_sync_in.email,
        full_name=user_sync_in.full_name,
        avatar_url=user_sync_in.avatar_url,
    )
    
    return current_user.to_public()


@router.post(
    "/", response_model=UserPublic, dependencies=[Depends(get_current_active_superuser)]
)
def create_user(session: SessionDep, user_in: UserCreate) -> Any:
    """
    create a new user (admin-only/manual password auth)
    """
    existing_user = crud.get_user_by_email(session=session, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = crud.create_user(session, user_in)
    return user.to_public()


@router.put("/{user_id}", response_model=UserPublic, dependencies=[Depends(get_current_active_superuser)])
def update_user(
    session: SessionDep, user_in: UserCreate, user_id: int
) -> UserPublic:
    """
    Update a user
    """
    user = crud.get_user_by_id(session=session, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update fields
    user.full_name = user_in.full_name
    user.email = user_in.email
    if user_in.avatar_url:
        user.avatar_url = user_in.avatar_url

    session.add(user)
    session.commit()
    session.refresh(user)

    return user.to_public()

@router.delete("/{user_id}", dependencies=[Depends(get_current_active_superuser)])
def delete_user(session: SessionDep, user_id: int) -> Any:
    """
    Delete a user
    """
    user = crud.get_user_by_id(session=session, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    session.delete(user)
    session.commit()
    return {"detail": "User deleted successfully"}

