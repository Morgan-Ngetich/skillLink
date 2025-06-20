from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.core import security
from app.core.config import settings
from app.models.users import User
from app import crud
from sqlmodel import Session
from app.api.deps import SessionDep

router = APIRouter()

@router.post("/login")
def login(session: SessionDep, form_data: OAuth2PasswordRequestForm = Depends()):
    user = crud.get_user_by_email(session, form_data.username)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    if not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = security.create_access_token(
        subject=str(user.id),
        expires_delta=timedelta(minutes=30),
    )
    return {"access_token": access_token, "token_type": "bearer"}
