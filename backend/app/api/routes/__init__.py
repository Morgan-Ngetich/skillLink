from app.api.routes.auth import router as auth_router
from app.api.routes.users import router as users_router
from app.api.routes.profiles import router as profiles_router
from app.api.routes.mentors import router as mentors_router
from app.api.routes.goals import router as goals_router
from app.api.routes.boards import router as boards_router
from app.api.routes.public import router as public_router
from app.api.routes.admin import router as admin_router

__all__ = [
    "auth_router",
    "users_router", 
    "profiles_router",
    "mentors_router",
    "goals_router",
    "boards_router",
    "public_router",
    "admin_router",
]