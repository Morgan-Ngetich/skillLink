from fastapi import Depends, HTTPException, status
from jose import jwt, JWTError
from pydantic import ValidationError
from typing import Annotated

from app.core.db import get_session
from app.core import security
from app.core.config import settings
from app.models.users import User, UserRole
from app import crud
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload

SessionDep = Annotated[Session, Depends(get_session)]
TokenDep = Annotated[str, Depends(security.oauth2_scheme)]

def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        payload = security.decode_token(token)  # Unified decoding
        user_id = payload.get("sub")
        email = payload.get("email")
        full_name = payload.get("user_metadata", {}).get("full_name" 
        or payload.get('full_name')  # Handle different metadata keys
        or email.split("@")[0])

        if not user_id:
            raise HTTPException(status_code=403, detail="Token missing subject")
    except Exception:
        raise HTTPException(status_code=403, detail="Invalid credentials")

    user = crud.get_user_by_id(session, user_id)

    if not user and email:
        user = crud.create_user_from_supabase(session, user_id, email, full_name)
    elif not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")

    return user

CurrentUser = Annotated[User, Depends(get_current_user)]

def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="User lacks superuser privileges")
    return current_user


def assign_role_to_user(session: Session, user_id: int, role_name: str) -> User:
    user = session.exec(
        select(User)
        .where(User.id == user_id)
        .options(selectinload(User.roles).selectinload(UserRole.role))  # Load roles deeply
    ).first()

    return crud.assign_role(session=session, user=user, role_name=role_name)
