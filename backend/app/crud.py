from sqlmodel import Session, select
from app.models.users import User, UserCreate, Role, UserRole, RoleName
from app.core.security import get_password_hash, verify_password


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

def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user
    
def assign_role(session: Session, user: User, role_name: RoleName) -> User:
    # Ensure we compare using the enum value
    role = session.exec(
        select(Role).where(Role.name == role_name.value)
    ).first()
    if not role:
        raise ValueError(f"Role `{role_name.value} ` not found")
    
    # Check is user already has this role
    has_role = any(ur.role_id == role.id for ur in user.roles)
    if has_role:
        return user # Already assigned
    
    user_role = UserRole(user_id=user.id, role_id=role.id)
    session.add(user_role)
    session.commit()
    session.refresh(user)
    return user