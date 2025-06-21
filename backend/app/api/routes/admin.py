from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlmodel import Session

from app.api.deps import SessionDep, assign_role_to_user
from app.models.users import RoleAssignRequest, UserPublic

router = APIRouter()

@router.post("/roles/assign", status_code=200)
def assign_roles(
  session: SessionDep,
  request: RoleAssignRequest = Body(...)
):
    """
    Assign Role to a user.
    """
    try:
        user = assign_role_to_user(
            session=session,
            user_id=request.user_id,
            role_name=request.role_name
        )
        return user.to_public()  # 👈 return the actual user instance
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

