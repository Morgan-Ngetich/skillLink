from fastapi import APIRouter, HTTPException, Body
from sqlmodel import select
from sqlalchemy.orm import selectinload
from app.api.deps import SessionDep
from app.models import User, RoleAssignRequest, UserRole
from app import crud

router = APIRouter()


@router.post("/roles/assign", status_code=200)
def assign_role(
    session: SessionDep,
    request: RoleAssignRequest = Body(...)
):
    """Assign role to user (admin only)"""
    try:
        user = session.exec(
            select(User)
            .where(User.id == request.user_id)
            .options(selectinload(User.roles).selectinload(UserRole.role))
        ).first()
        
        if not user:
            raise ValueError("User not found")
        
        updated_user = crud.assign_role(
            session=session,
            user=user,
            role_name=request.role_name
        )
        return updated_user.to_public()
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))