from fastapi import APIRouter
from app.api.routes.profiles import my_profile, profiles

router = APIRouter()

# Order matters - most specific first
router.include_router(my_profile.router, tags=["profiles"])
router.include_router(profiles.router, tags=["profiles"])