from fastapi import APIRouter, HTTPException, Depends
from typing import Any

from sqlmodel import select
from sqlalchemy import func
from app.api.deps import CurrentUser, CurrentUserOptional, SessionDep, require_role
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
    dependencies=[Depends(require_role(RoleName.SUPERUSER))],
)
def list_users(session: SessionDep, skip: int = 0, limit: int = 100, current_user: CurrentUserOptional = None) -> Any:
    """List all users (admin only)"""
    count_statement = select(func.count()).select_from(User)
    count = session.exec(count_statement).one()

    statement = select(User).offset(skip).limit(limit)
    users = session.exec(statement).all()

    return UsersPublic(data=[user.to_public(current_user_id=current_user.id if current_user else None) for user in users], count=count)


@router.get("/{identifier}", response_model=UserPublic)
def get_user(
    identifier: str,
    session: SessionDep,
    current_user: CurrentUserOptional
) -> UserPublic:
    """
    Get user by ID or UUID (public endpoint)

    Examples:
        - GET /users/123           # By user ID
        - GET /users/550e8400-...  # By UUID
    """
    user = crud.get_user_by_identifier(session, identifier)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    public_user = user.to_public(current_user_id=current_user.id if current_user else None)
    return public_user


@router.post(
    "/",
    response_model=UserPublic,
    dependencies=[Depends(require_role(RoleName.SUPERUSER))],
)
def create_user(session: SessionDep, user_in: UserCreate) -> Any:
    """Create new user (admin only)"""
    existing_user = crud.get_user_by_email(session=session, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=400, detail="User with this email already exists"
        )

    user = crud.create_user(session, user_in)
    return user.to_public()


@router.patch(
    "/{user_id}",
    response_model=UserPublic,
    dependencies=[Depends(require_role(RoleName.SUPERUSER))],
)
def update_user(session: SessionDep, user_id: int, user_in: UserUpdate) -> UserPublic:
    """Update user by ID (admin only)"""
    user = crud.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = crud.update_user(session, user, user_in)
    return updated_user.to_public()


@router.delete("/me", status_code=200)
def delete_own_account(
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    user = crud.get_user_by_id(session=session, user_id=current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Expunge all loaded objects so ORM doesn't try to manage cascades itself
    session.expunge_all()

    # Re-fetch just the user without loading relationships
    user = session.get(User, current_user.id)
    session.delete(user)
    session.commit()

    return {"status": "success", "detail": "Account deleted successfully"}


@router.delete("/{user_id}", dependencies=[Depends(require_role(RoleName.SUPERUSER))])
def delete_user(session: SessionDep, user_id: int) -> Any:
    """Delete user (admin only)"""
    user = crud.get_user_by_id(session=session, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    session.delete(user)
    session.commit()
    return {"status": "success", "detail": "User deleted"}
