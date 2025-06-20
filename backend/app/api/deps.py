from fastapi import Depends, HTTPException, status
from jose import jwt, JWTError
from pydantic import ValidationError
from typing import Annotated

from app.core.db import get_session
from app.core import security
from app.core.config import settings
from app.models.users import User
from app import crud
from sqlmodel import Session

SessionDep = Annotated[Session, Depends(get_session)]
TokenDep = Annotated[str, Depends(security.oauth2_scheme)]

def get_current_user(session: SessionDep, token: TokenDep) -> User:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        user_id = payload.get("sub")
        email = payload.get("email")

        if not user_id:
            raise HTTPException(status_code=403, detail="Token missing subject")
    except (JWTError, ValidationError, ValueError):
        raise HTTPException(status_code=403, detail="Invalid credentials")

    user = crud.get_user_by_id(session, user_id)
    
    if not user:
        if email:
            user = crud.create_user_from_supabase(session, user_id, email)
        else:
            raise HTTPException(status_code=404, detail="User not found")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")

    return user

CurrentUser = Annotated[User, Depends(get_current_user)]

def get_current_active_superuser(current_user: CurrentUser) -> User:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="User lacks superuser privileges")
    return current_user
