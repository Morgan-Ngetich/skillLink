from fastapi import APIRouter, Depends
from app.api.routes.admin import roles
from app.api.deps import require_role
from app.models import RoleName

router = APIRouter(dependencies=[Depends(require_role(RoleName.SUPERUSER))])

router.include_router(roles.router, tags=["admin"])