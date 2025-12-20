from fastapi import APIRouter
from app.api.routes.users import me, users, sync

router = APIRouter()

# Order matters - most specific first
router.include_router(me.router, tags=["users"])
router.include_router(sync.router, tags=["users"])
router.include_router(users.router, tags=["users"])