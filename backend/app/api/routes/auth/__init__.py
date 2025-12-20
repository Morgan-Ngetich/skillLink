from fastapi import APIRouter
from app.api.routes.auth import login

router = APIRouter()
router.include_router(login.router, tags=["auth"])