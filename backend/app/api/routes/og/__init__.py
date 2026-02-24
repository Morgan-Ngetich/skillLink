from fastapi import APIRouter
from app.api.routes.og import og_profile, og_session

router = APIRouter()

# Order matters - most specific first
router.include_router(og_profile.router, prefix="/og", tags=["og"])
router.include_router(og_session.router, prefix="/og", tags=["og"])

