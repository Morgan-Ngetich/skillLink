from fastapi import HTTPException
from sqlmodel import Session, select
from app.models.users import (
    User, 
    UserCreate,
    UserUpdate,
    Role,
    UserRole,
    RoleName,
    UserProfile,
    UserProfileCreate,
    UserProfileUpdate,
    MentorProfile,
    MentorProfileCreate,
    MentorProfileUpdate,
)
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

def update_user(session: Session, user: User, user_in: UserUpdate) -> User:
    for key, value in user_in.dict(exclude_unset=True).items():
        setattr(user, key, value)

    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def create_user_from_supabase(session: Session, user_id: UUID, email: str, full_name: str, avatar_url: str) -> User:
    user = User(
        uuid=user_id,
        email=email,
        full_name=full_name,
        avatar_url=avatar_url,
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
        raise HTTPException(status_code=400, detail=f"Invalid role: {role_name}")

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
    session: Session, user_id: UUID, email: str, full_name: str | None = None, avatar_url: str | None = None
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
    
    if avatar_url:
        user.avatar_url = avatar_url

    session.add(user)
    session.commit()
    session.refresh(user)

    return user


def update_synced_user_info(
    session: Session,
    user: User,
    email: str,
    full_name: str | None = None,
    avatar_url: str | None = None,
) -> User:
    """
    Updates user info only if changed. Logs each updated field.
    """
    updated = False

    if user.email != email:
        user.email = email
        updated = True

    if full_name is not None and user.full_name != full_name:
        user.full_name = full_name
        updated = True

    if avatar_url is not None and user.avatar_url != avatar_url:
        user.avatar_url = avatar_url
        updated = True

    if updated:
        session.add(user)
        session.commit()
        session.refresh(user)
    else:
        raise HTTPException(status_code=200, detail="No changes detected.")

    return user



# =========== USERPROFILES ============
def get_user_profile(session: Session, user_id: int) -> UserProfile | None:
    return session.get(UserProfile, user_id)

def get_user_profile_or_404(session: Session, user_id: int) -> UserProfile:
    profile = get_user_profile(session, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="UserProfile not found")
    return profile

def ensure_user_profile_not_exists(session: Session, user_id: int):
    if get_user_profile(session, user_id):
        raise HTTPException(status_code=400, detail="Profile already exists for this user")
    
def create_user_profile(session: Session, profile_in: UserProfileCreate) -> UserProfile:
    ensure_user_profile_not_exists(session, profile_in.user_id)
    profile = UserProfile.model_validate(profile_in)
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile

def update_user_profile(session: Session, user_id: int, profile_in: UserProfileUpdate):
    profile = get_user_profile_or_404(session, user_id)

    for key, value in profile_in.dict(exclude_unset=True).items():
        setattr(profile, key, value)
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile
    
# MENTOR PROFILE
def get_mentor_profile(session: Session, user_id: int) -> MentorProfile | None:
    return session.get(MentorProfile, user_id)

def get_mentor_profile_or_404(session: Session, user_id: int) -> MentorProfile:
    profile = get_mentor_profile(session, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="MentorProfile not found")
    return profile


def create_mentor_profile(session: Session, profile_in: MentorProfileCreate) -> MentorProfile:
    existing_profile = get_mentor_profile(session, profile_in.user_id)
    if existing_profile:
        raise HTTPException(status_code=400, detail="MentorProfile already exists for this user")
    
    profile = MentorProfile.model_validate(profile_in)
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile

def update_mentor_profile(session: Session, user_id: int, profile_in: MentorProfileUpdate) -> MentorProfile:
    profile = get_mentor_profile_or_404(session, user_id)
    for key, value in profile_in.dict(exclude_unset=True).items():
        setattr(profile, key, value)
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile