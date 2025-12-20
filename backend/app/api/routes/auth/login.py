from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.core import security
from app.core.config import settings
from app import crud
from app.api.deps import SessionDep
from app.models.auth import Token

router = APIRouter()

@router.post("/login/access-token")
def login(session: SessionDep, form_data: OAuth2PasswordRequestForm = Depends()) -> Token:
    user = crud.authenticate(
      session=session, 
      email=form_data.username, 
      password=form_data.password
    ) 
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")

    if not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    # access_token = security.create_access_token(
    #     subject=str(user.id),
    #     expires_delta=timedelta(minutes=30),
    # )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # return {"access_token": access_token, "token_type": "bearer"}
    # Pass the user.id as str
    return Token(
      access_token=security.create_access_token(
        user.id,
        expires_delta=access_token_expires
      ),
    )
