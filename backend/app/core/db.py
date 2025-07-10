from sqlmodel import create_engine, Session, SQLModel, select
from app.core.config import settings
from typing import Generator

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, echo=True)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
