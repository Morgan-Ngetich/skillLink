from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from app.utils.current_request_user import RequestContext
from sqlmodel import Session, select
from typing import Annotated, Optional
from app.core.db import get_session
from app.core import security
from app.core.config import settings
from app.models import User, RoleName
from app import crud
from datetime import datetime

SessionDep = Annotated[Session, Depends(get_session)]
TokenDep = Annotated[str, Depends(security.oauth2_scheme)]
BearerDep = Annotated[HTTPAuthorizationCredentials, Depends(security.bearer_scheme)]

TokenDepOptional = Annotated[Optional[str], Depends(security.oauth2_scheme_optional)]
BearerDepOptional = Annotated[Optional[HTTPAuthorizationCredentials], Depends(security.bearer_scheme_optional)]

def get_current_user(
    session: SessionDep,
    form_token: TokenDep = None,
    bearer_token: BearerDep = None,
) -> User:
    print(f"Received Bearer Token: {bearer_token}")
    token = bearer_token.credentials if bearer_token else form_token

    if not token:
        raise HTTPException(status_code=403, detail="No credentials provided")

    # Local override
    # "dev-admin" should'nt be set in the settings, as it's not needed within the prod variables.
    if settings.ENVIRONMENT == "local" and token == "dev-admin":
        user = session.exec(select(User).where(User.email == settings.FIRST_SUPERUSER)).first()
        if not user:
            raise HTTPException(status_code=404, detail="Dev admin user not found")
        RequestContext.set_user(user.id)
        return user

    try:
        print(f"🔐 Attempting to decode token: {token[:50]}...")
        payload = security.decode_token(token)
        print(f"✅ Token decoded successfully: {payload}")
        
        user_id = payload.get("sub")
        email = payload.get("email")
        avatar_url = payload.get("avatar_url", settings.DEFAULT_AVATAR_URL)
        full_name = payload.get("user_metadata", {}).get("full_name"
            or payload.get("full_name")
            or email.split("@")[0])
        if not user_id:
            raise HTTPException(status_code=403, detail="Token missing subject")
    except Exception as e:
        raise HTTPException(status_code=403, detail=f"Invalid credentials: {e}")

    user = crud.get_user_by_identifier(session, user_id)

    if not user and email:
        print(f"➕ Creating new user: {email}")
        user = crud.create_user_from_supabase(session, user_id, email, full_name, avatar_url)
    elif not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Inactive user")

    RequestContext.set_user(user.id)
    return user

CurrentUser = Annotated[User, Depends(get_current_user)]

def get_current_user_optional(
    session: SessionDep,
    form_token: TokenDepOptional = None,
    bearer_token: BearerDepOptional = None,
) -> Optional[User]:
    """Returns User if authenticated, None if not"""
    # If no tokens at all, return None immediately
    if not form_token and not bearer_token:
        RequestContext.clear_user()
        print("⚠️ get_current_user_optional: No tokens provided")
        return None
    
    try:
        user = get_current_user(session, form_token, bearer_token)
        print(f"✅ get_current_user_optional: Successfully got user {user.id}")
        return user
    except HTTPException as e:
        RequestContext.clear_user()
        print(f"⚠️ get_current_user_optional: Auth failed - {e.detail}")
        return None
    except Exception as e:
        RequestContext.clear_user()
        print(f"❌ get_current_user_optional: Unexpected error - {e}")
        return None

CurrentUserOptional = Annotated[Optional[User], Depends(get_current_user_optional)]

# This is used in a scenario where the current user may be None. .eg For session listing with public/private checks 
CurrentUserOptional = Annotated[Optional[User], Depends(get_current_user_optional)]

def require_role(*allowed_roles: RoleName):
    """
    support multiple roles 
    """
    async def role_checker(current_user: CurrentUser):
        role_map = {
            RoleName.SUPERUSER: current_user.is_superuser,
            RoleName.MENTOR: current_user.is_mentor,
            RoleName.MENTEE: current_user.is_mentee,
        }

        if not any(role_map.get(role, False) for role in allowed_roles):
            allowed_names = ", ".join(role.value for role in allowed_roles)
            print(
                f"[{datetime.now()}] Access denied for {current_user.email}: "
                f"required one of [{allowed_names}], user flags: "
                f"superuser={current_user.is_superuser}, "
                f"mentor={current_user.is_mentor}, mentee={current_user.is_mentee}"
            )
            raise HTTPException(
                status_code=403,
                detail=f"Requires one of: {allowed_names}"
            )

        return current_user

    return role_checker