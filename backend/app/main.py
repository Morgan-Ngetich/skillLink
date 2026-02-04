from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from app.api.main import api_router
from app.core.config import settings

app = FastAPI(    
    title=settings.PROJECT_NAME,
    docs_url=f"{settings.API_V1_STR}/docs",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",    
)

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Allow CORS for all origins
if settings.ENVIRONMENT == "local":
    origins = [
        "http://localhost",
        "http://localhost:3000"
        "http://localhost:5173",
        "http://127.0.0.1:5174",
    ]
else:
    origins = [
        "https://frontend-production-a85f.up.railway.app",
        "https://backend-production-3e33.up.railway.app"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/debug/headers")
async def debug_headers(request: Request):
    return {
        "authorization": request.headers.get("authorization"),
        "x-original-method": request.headers.get("x-original-method"),
        "host": request.headers.get("host"),
        "headers": dict(request.headers)
    }