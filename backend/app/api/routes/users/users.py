from fastapi import APIRouter, HTTPException, Depends
from typing import Any
from sqlmodel import select
from sqlalchemy import func
from app.api.deps import SessionDep, CurrentUser, require_role
from app.models import (
    User,
    UserPublic,
    UsersPublic,
    UserCreate,
    UserUpdate,
    RoleName,
)
from app import crud

router = APIRouter()


@router.get(
    "/",
    response_model=UsersPublic,
    dependencies=[Depends(require_role(RoleName.SUPERUSER))]
)
def list_users(
    session: SessionDep,
    skip: int = 0,
    limit: int = 100
) -> Any:
    """List all users (admin only)"""
    count_statement = select(func.count()).select_from(User)
    count = session.exec(count_statement).one()
    
    statement = select(User).offset(skip).limit(limit)
    users = session.exec(statement).all()
    
    return UsersPublic(
        data=[user.to_public() for user in users],
        count=count
    )


@router.get("/{identifier}", response_model=UserPublic)
def get_user(identifier: str, session: SessionDep) -> UserPublic:
    """
    Get user by ID or UUID (public endpoint)
    
    Examples:
        - GET /users/123           # By user ID
        - GET /users/550e8400-...  # By UUID
    """
    user = crud.get_user_by_identifier(session, identifier)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user.to_public()


@router.post(
    "/",
    response_model=UserPublic,
    dependencies=[Depends(require_role(RoleName.SUPERUSER))]
)
def create_user(session: SessionDep, user_in: UserCreate) -> Any:
    """Create new user (admin only)"""
    existing_user = crud.get_user_by_email(session=session, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    
    user = crud.create_user(session, user_in)
    return user.to_public()


@router.patch(
    "/{user_id}",
    response_model=UserPublic,
    dependencies=[Depends(require_role(RoleName.SUPERUSER))]
)
def update_user(
    session: SessionDep,
    user_id: int,
    user_in: UserUpdate
) -> UserPublic:
    """Update user by ID (admin only)"""
    user = crud.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = crud.update_user(session, user, user_in)
    return updated_user.to_public()


@router.delete(
    "/{user_id}",
    dependencies=[Depends(require_role(RoleName.SUPERUSER))]
)
def delete_user(session: SessionDep, user_id: int) -> Any:
    """Delete user (admin only)"""
    user = crud.get_user_by_id(session=session, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    session.delete(user)
    session.commit()
    return {"status": "success", "detail": "User deleted"}