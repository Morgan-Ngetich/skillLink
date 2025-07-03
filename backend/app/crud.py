from sqlmodel import Session, select
from app.models.users import User, UserCreate, Role, UserRole, RoleName
from app.core.security import get_password_hash, verify_password
from uuid import UUID

def get_user_by_email(session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


# Gets users by ID, First checks for the UUID, => Supabase Users
def get_user_by_id(session: Session, user_id: str | int) -> User | None:
    try:
        # Tries UUID parsing first
        user_uuid = UUID(str(user_id)) 
        return session.exec(select(User).where(User.uuid == user_uuid)).first()
    except ValueError:
        return session.get(User, int(user_id))  # Fallback to integer local ID


def create_user(session: Session, user_in: UserCreate) -> User:
    hashed_password = get_password_hash(user_in.password)
    db_user = User.model_validate(
        user_in, update={"hashed_password": hashed_password}
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def create_user_from_supabase(session: Session, user_id: str, email: str, full_name: str) -> User:
    user = User(
        uuid=UUID(user_id),
        email=email,
        full_name=full_name,
        hashed_password="",  # Password managed by Supabase, so blank here
        is_active=True
    )
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


def create_role(session: Session, role_name: RoleName) -> Role:
    # Ensure it's a valid enum member
    if role_name not in RoleName:
        raise ValueError(f"Invalid role: {role_name}")

    # Check if the role already exists
    existing_role = session.exec(
        select(Role).where(Role.name == role_name.value)
    ).first()

    # If it exists, return the existing role
    if existing_role:
        return existing_role
    # Else it doesn't exist, create the new role
    new_role = Role(name=role_name.value)
    session.add(new_role)
    session.commit()
    session.refresh(new_role)
    return new_role


def assign_role(session: Session, user: User, role_name: RoleName) -> User:
    # Create the role if it doesn't exist
    role = create_role(session, role_name)

    # Check if the user already has this role
    has_role = session.exec(
        select(UserRole).where(
            UserRole.user_id == user.id, UserRole.role_id == role.id
        )
    ).first()

    if has_role:
        return user  # User already has this role

    # Assign the role to the user
    user_role = UserRole(user_id=user.id, role_id=role.id)
    session.add(user_role)
    session.commit()
    session.refresh(user)
    return user


def sync_user_from_supabase(
    session: Session, user_id: str, email: str, full_name: str | None = None
) -> User:
    """
    Syncs a user from Supabase by creating or updating their record.
    """
    user = get_user_by_id(session, user_id)

    if not user:
        user = create_user_from_supabase(session, user_id, email, full_name)
    
    # Update user's full name if provided
    if full_name:
        user.full_name = full_name

    session.add(user)
    session.commit()
    session.refresh(user)

    return user