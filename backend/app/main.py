from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.api.main import api_router
from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager to initialize the database and create the admin user.
    """
    from app.core.db import init_db_and_create_admin
    # Initialize the database and create the admin user if it doesn't exist
    init_db_and_create_admin()
    yield

app = FastAPI(    
    title=settings.PROJECT_NAME,
    docs_url=f"{settings.API_V1_STR}/docs",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",    
    lifespan=lifespan
)

# Allow CORS for all origins (change in production for security!)
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Replace ["*"] with a list of allowed domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)
