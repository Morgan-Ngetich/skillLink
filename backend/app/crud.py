from sqlmodel import Session, select
from app.models.users import User, UserCreate
from app.core.security import get_password_hash


def get_user_by_email(session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def get_user_by_id(session: Session, user_id: str | int) -> User | None:
    return session.get(User, user_id)


def create_user(session: Session, user_in: UserCreate) -> User:
    hashed_password = get_password_hash(user_in.password)
    db_user = User.model_validate(
        user_in, update={"hashed_password": hashed_password}
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def create_user_from_supabase(session: Session, user_id: str, email: str) -> User:
    user = User(id=user_id, email=email, is_active=True)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
