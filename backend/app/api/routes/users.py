from fastapi import APIRouter, Depends, HTTPException
from typing import Any
from sqlmodel import select
from sqlalchemy import func
from app.models.users import (
    User, 
    UserPublic, 
    UsersPublic,
    UserCreate,
    UserUpdate,
    UserSyncIn,
    RoleName,
)
from app.api.deps import CurrentUser, require_role, SessionDep
from app import crud
from app.core.config import settings
from app.tasks.sync import sync_user_from_supabase_task

router = APIRouter()


@router.get("/", response_model=UsersPublic, dependencies=[Depends(require_role(RoleName.SUPERUSER))])
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


@router.get("/{user_id}", response_model=UserPublic)
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
   current_user: CurrentUser,
   session: SessionDep
) -> UserPublic:
    """
    Trigger a background task to sync a user from Supabase.
    """
    if current_user.uuid != user_sync_in.user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only sync your own user profile.",
        )
        
    # Prevent duplicate syncs by checking for email
    existing_user = crud.get_user_by_email(session, user_sync_in.email)
    if existing_user:
        # Optional: check if UUID matches
        if str(existing_user.uuid) != str(user_sync_in.user_id):
            raise HTTPException(
                status_code=409,
                detail="A user with this email already exists.",
            )
            
        updated_user = crud.update_synced_user_info(
            session,
            existing_user,
            email=user_sync_in.email,
            full_name=user_sync_in.full_name,
            avatar_url=user_sync_in.avatar_url,
        )
        
        return updated_user.to_public()

    
    # Trigger a background task if new user
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


@router.post("/", response_model=UserPublic, dependencies=[Depends(require_role(RoleName.SUPERUSER))])
def create_user(session: SessionDep, user_in: UserCreate) -> Any:
    """
    Create a new user (admin-only). Remember all Auths happen over Supabase
    """
    existing_user = crud.get_user_by_email(session=session, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = crud.create_user(session, user_in)
    return user.to_public()


@router.patch("/me", response_model=UserPublic)
def update_me(session: SessionDep, current_user: CurrentUser, user_in: UserUpdate):
    """
    For authenticated users to update their own info. Backend already knows who you are via the token.
    """
    updated_user = crud.update_user(session, current_user, user_in)
    return updated_user.to_public()


@router.patch("/{user_id}", response_model=UserPublic, dependencies=[Depends(require_role(RoleName.SUPERUSER))])
def update_user(session: SessionDep, current_user: CurrentUser, user_in: UserUpdate, user_id: int):
    """
    For admins (superusers) to update any user by ID.
    """
    user = crud.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not current_user.is_superuser and current_user.id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this user")

    updated_user = crud.update_user(session, user, user_in)
    return updated_user.to_public()


@router.delete("/{user_id}", dependencies=[Depends(require_role(RoleName.SUPERUSER))])
def delete_user(session: SessionDep, user_id: int) -> Any:
    """
    Delete a user
    """
    user = crud.get_user_by_id(session=session, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    session.delete(user)
    session.commit()
    return {"status": "success", "detail": "User deleted successfully"}


# ================ PROFILES ================



