from sqlmodel import create_engine, Session, SQLModel, select
from app.core.config import settings
from app.models.users import User, RoleName  # Import all related models
from app.core.security import get_password_hash
from typing import Generator

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, echo=True)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
