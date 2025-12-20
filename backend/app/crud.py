import sqlalchemy as sa
from fastapi import HTTPException
from typing import List, Dict, Optional, Union, Tuple, Any
from enum import Enum
from sqlmodel import Session, select
from datetime import datetime, timezone
from sqlalchemy.orm import selectinload
from app.models import (
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
    MentorSettings,
    MentorSettingsCreate,
    MentorSettingsUpdate,
    MentorSession,
    MentorSessionCreate,
    MentorSessionUpdate,
    MentorService,
    MentorServiceCreate,
    MentorServiceUpdate,
    MentorSessionBooking,
    BookingStatus,
    Board,
    BoardList,
    BoardCreate,
    BoardUpdate,
    Goal,
    GoalCreate,
    GoalUpdate,
    GoalType,
    GoalDifficulty,
    CardCreate,
    CardUpdate,
    Card,
    CardStatus,
    CardPriority,
    Roadmap,
    RoadCreate,
    RoadmapUpdate,
)
from app.core.security import get_password_hash, verify_password
from uuid import UUID
from app.utils.logger_config import llm_logger
# from app.utils.logo_fetcher import enrich_with_logos


def get_user_by_email(session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


# # Gets users by ID, First checks for the UUID, => Supabase Users
# def get_user_by_id(session: Session, user_id: str | int) -> User | None:
#     try:
#         # Tries UUID parsing first
#         user_uuid = UUID(str(user_id))
#         return session.exec(select(User).where(User.uuid == user_uuid)).first()
#     except ValueError:
#         return session.get(User, int(user_id))  # Fallback to integer local ID


def base_user_query():
    return select(User).options(
        selectinload(User.profile),
        selectinload(User.mentor_profile)
        .selectinload(MentorProfile.sessions)
        .selectinload(MentorSession.bookings),
        selectinload(User.mentor_profile).selectinload(MentorProfile.services),
        selectinload(User.mentor_profile).selectinload(MentorProfile.settings),
        selectinload(User.boards),
        selectinload(User.roadmaps),
        selectinload(User.goals),
        selectinload(User.assigned_cards),
        selectinload(User.created_cards),
        selectinload(User.roles).selectinload(UserRole.role),
    )


def get_user_by_id(session: Session, user_id: int) -> User | None:
    """
    Get user by ID with all related data eager-loaded

    Loads:
    - User profile
    - Mentor profile (if exists)
      - Sessions with bookings
      - Services
      - Settings
    - Boards, roadmaps, goals, cards
    """
    query = base_user_query().where(User.id == user_id)
    return session.exec(query).first()


def get_user_by_uuid(session: Session, user_uuid: UUID) -> User | None:
    """
    Get user by UUID with all related data eager-loaded

    Same as get_user_by_id but uses UUID for lookup
    """
    query = base_user_query().where(User.uuid == user_uuid)
    return session.exec(query).first()


def get_user_by_identifier(session: Session, identifier: str) -> User | None:
    """
    Get user by ID or UUID with automatic detection

    Args:
        identifier: Can be numeric user_id or UUID string

    Returns:
        User with all related data eager-loaded
    """
    # Try to parse as integer (user_id)
    try:
        user_id = int(identifier)
        return get_user_by_id(session, user_id)
    except ValueError:
        # Not numeric, try as UUID
        try:
            user_uuid = UUID(identifier)
            return get_user_by_uuid(session, user_uuid)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid identifier format. Must be numeric ID or valid UUID",
            )


def create_user(session: Session, user_in: UserCreate) -> User:
    print(f"DEBUG crud.py: user_in.password type: {type(user_in.password)}")
    print(f"DEBUG crud.py: user_in.password length: {len(user_in.password)}")
    print(f"DEBUG crud.py: user_in.password value: {user_in.password}")
    hashed_password = get_password_hash(user_in.password)
    db_user = User.model_validate(user_in, update={"hashed_password": hashed_password})
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def update_user(session: Session, user: User, user_in: UserUpdate) -> User:
    for key, value in user_in.model_dump(exclude_unset=True).items():
        setattr(user, key, value)

    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def create_user_from_supabase(
    session: Session, user_id: UUID, email: str, full_name: str, avatar_url: str
) -> User:
    user = User(
        uuid=user_id,
        email=email,
        full_name=full_name,
        avatar_url=avatar_url,
        hashed_password="",  # Password managed by Supabase, so blank here
        is_active=True,
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
        select(UserRole).where(UserRole.user_id == user.id, UserRole.role_id == role.id)
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
    session: Session,
    user_id: UUID,
    email: str,
    full_name: str | None = None,
    avatar_url: str | None = None,
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


def get_user_skills(session: Session, user_id: int) -> List[str]:
    profile = get_user_profile_or_404(session, user_id)
    return profile.skills or []


def ensure_user_profile_not_exists(session: Session, user_id: int):
    if get_user_profile(session, user_id):
        raise HTTPException(
            status_code=409, detail="Profile already exists for this user"
        )


def serialize_datetime_fields(items):
    if not items:
        return items
    serialized = []
    for item in items:
        new_item = item.copy()
        for date_field in ["start_date", "end_date"]:
            if date_field in new_item and new_item[date_field] is not None:
                # Convert datetime to ISO string
                new_item[date_field] = new_item[date_field].isoformat()
        serialized.append(new_item)
    return serialized


def create_user_profile(
    session: Session, profile_in: UserProfileCreate, user_id: int
) -> UserProfile:
    ensure_user_profile_not_exists(session, user_id)

    create_data = profile_in.model_dump(exclude_unset=True)

    if "education" in create_data:
        create_data["education"] = serialize_datetime_fields(create_data["education"])
    if "experience" in create_data:
        create_data["experience"] = serialize_datetime_fields(create_data["experience"])

    # create_data = enrich_with_logos(create_data)

    profile = UserProfile(user_id=user_id, **create_data)
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile


def update_user_profile(session: Session, user_id: int, profile_in: UserProfileUpdate):
    profile = get_user_profile_or_404(session, user_id)

    update_data = profile_in.model_dump(exclude_unset=True)

    # Serialize datetimes inside education and experience before setting
    if "education" in update_data:
        update_data["education"] = serialize_datetime_fields(update_data["education"])
    if "experience" in update_data:
        update_data["experience"] = serialize_datetime_fields(update_data["experience"])

    # update_data = enrich_with_logos(update_data)

    for key, value in update_data.items():
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


# TODO: Consider removing this. Already the UserPublic has all the data, so a single users/{id or uuid}, does the job
# def get_public_mentor_profile_with_relations(
#     session: Session,
#     identifier: str  # can be a numeric user_id or a UUID string
# ) -> MentorProfile:
#     """
#     Get a mentor profile with all related data eager-loaded.
#     Automatically detects numeric user_id vs UUID.

#     Single query loads:
#     - User details
#     - All sessions with bookings
#     - All services
#     - Settings
#     """
#     query = select(MentorProfile).options(
#         selectinload(MentorProfile.user),
#         selectinload(MentorProfile.sessions).selectinload(MentorSession.bookings),
#         selectinload(MentorProfile.services),
#         selectinload(MentorProfile.settings),
#     )

#     # Detect numeric user_id or UUID
#     try:
#         # Try numeric user_id
#         user_id = int(identifier)
#         query = query.where(MentorProfile.user_id == user_id)
#     except ValueError:
#         # Not numeric, treat as UUID
#         try:
#             UUID(identifier)  # validate UUID format
#         except ValueError:
#             raise HTTPException(status_code=400, detail="Invalid UUID format")
#         query = query.where(
#             MentorProfile.user.has(User.uuid == UUID(identifier))
#         )

#     profile = session.exec(query).first()

#     if not profile:
#         raise HTTPException(status_code=404, detail="Mentor profile not found")

#     return profile


def list_public_mentors(
    session: Session,
    expertise: Optional[str] = None,
    available: Optional[bool] = None,
    limit: int = 20,
    offset: int = 0,
) -> List[User]:
    """
    List mentors for explore page with optional filters and pagination.
    - Only returns active mentors with visible profiles.
    
    NOTE: By joining MentorProfile, we implicitly filter to mentors only
    """
    
    query = (
        select(User)
        .join(MentorProfile, MentorProfile.user_id == User.id)
        .join(MentorSettings, MentorSettings.mentor_id == MentorProfile.user_id)
        .where(
            User.is_active,
            MentorSettings.profile_visibility
        )
        .options(
            selectinload(User.mentor_profile).selectinload(MentorProfile.services),
            selectinload(User.mentor_profile).selectinload(MentorProfile.sessions),
            selectinload(User.mentor_profile).selectinload(MentorProfile.settings),
        )
    )

    # Expertise filter
    if expertise:
        query = query.where(
            sa.func.lower(expertise).ilike(
                sa.func.any(sa.func.lower(MentorProfile.expertise))
            )
        )

    # Availability filter
    if available is not None:
        query = query.where(
            MentorSettings.currently_open_to_mentees == available
        )

    query = query.offset(offset).limit(limit)

    return list(session.exec(query).all())


def get_featured_mentors(session: Session, limit: int = 20) -> List[User]:
    """
    Get featured mentors (earliest sign-ups)
    - Returns User objects with loaded mentor relationships
    TODO:// Replace with explicit 'is_featured' flag or rating-based sorting
    """
    return list(
        session.exec(
            select(User)
            .join(MentorProfile, User.id == MentorProfile.user_id)
            .options(
                # Load mentor profile with its relationships
                selectinload(User.mentor_profile).selectinload(MentorProfile.sessions),
                selectinload(User.mentor_profile).selectinload(MentorProfile.services),
                selectinload(User.mentor_profile).selectinload(MentorProfile.settings),
            )
            .order_by(MentorProfile.created_at.asc())
            .limit(limit)
        ).all()
    )


def create_mentor_profile(
    session: Session, profile_in: MentorProfileCreate
) -> MentorProfile:
    existing_profile = get_mentor_profile(session, profile_in.user_id)
    if existing_profile:
        raise HTTPException(
            status_code=400, detail="MentorProfile already exists for this user"
        )

    profile = MentorProfile.model_validate(profile_in)
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile


def update_mentor_profile(
    session: Session, user_id: int, profile_in: MentorProfileUpdate
) -> MentorProfile:
    profile = get_mentor_profile_or_404(session, user_id)
    for key, value in profile_in.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile


# MENTOR Settings:
def get_mentor_settings(session: Session, mentor_id: int) -> MentorSettings | None:
    return session.exec(
        select(MentorSettings).where(MentorSettings.mentor_id == mentor_id)
    ).first()


def get_mentor_settings_or_404(session: Session, mentor_id: int) -> MentorSettings:
    settings = get_mentor_settings(session, mentor_id)
    if not settings:
        raise HTTPException(status_code=404, detail="Mentor settings not found")
    return settings


def create_mentor_settings(
    session: Session, settings_in: MentorSettingsCreate
) -> MentorSettings:
    """Create mentor settings (after profile creation)."""
    # Check if settings already exist for this mentor
    existing = get_mentor_settings(session, settings_in.mentor_id)
    if existing:
        raise HTTPException(status_code=400, detail="Mentor settings already exist")

    settings = MentorSettings.model_validate(settings_in)
    session.add(settings)
    session.commit()
    session.refresh(settings)
    return settings


def update_mentor_settings(
    session: Session, mentor_id: int, settings_in: MentorSettingsUpdate
) -> MentorSettings:
    settings = get_mentor_settings_or_404(session, mentor_id)

    # Ensure boolean False values are preserved
    update_data = settings_in.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(settings, key, value)

    session.add(settings)
    session.commit()
    session.refresh(settings)
    return settings


# MENTOR START. Moved up, for function calling
def get_mentor_stats(session: Session, mentor_id: int) -> Dict[str, Any]:
    """
    Get comprehensive mentor statistics including bookings, sessions, and mentees
    Uses SQL queries for performance - avoids loading relationships into memory
    """
    profile = get_mentor_profile_or_404(session, mentor_id)

    # MENTEE STATS

    # Get unique mentees count (users who have confirmed/completed bookings)
    # Only count mentees who actually attended or have confirmed bookings
    unique_mentees = session.exec(
        select(sa.func.count(sa.distinct(MentorSessionBooking.mentee_id)))
        .join(MentorSession)
        .where(
            MentorSession.mentor_id == mentor_id,
            MentorSessionBooking.status.in_(
                [BookingStatus.CONFIRMED, BookingStatus.COMPLETED]
            ),
        )
    ).one()

    # BOOKINGS STATS by STATUS

    # Get total bookings by status
    booking_stats = session.exec(
        select(
            MentorSessionBooking.status,
            sa.func.count(MentorSessionBooking.id).label("count"),
        )
        .join(MentorSession)
        .where(MentorSession.mentor_id == mentor_id)
        .group_by(MentorSessionBooking.status)
    ).all()

    # Convert to dict for easy access
    # Initialize all possible statuses with 0
    bookings_by_status = {
        BookingStatus.PENDING: 0,
        BookingStatus.CONFIRMED: 0,
        BookingStatus.COMPLETED: 0,
        BookingStatus.CANCELLED_BY_MENTEE: 0,
        BookingStatus.CANCELLED_BY_MENTOR: 0,
        BookingStatus.NO_SHOW_MENTEE: 0,
        BookingStatus.NO_SHOW_MENTOR: 0,
        BookingStatus.EXPIRED: 0,
    }
    for status, count in booking_stats:
        bookings_by_status[status] = count

    # SESSION STATS
    # Get active sessions count (not cancelled, is_active=True)
    now = datetime.now(timezone.utc)

    active_sessions = session.exec(
        select(sa.func.count(MentorSession.id)).where(
            MentorSession.mentor_id == mentor_id,
            MentorSession.is_active,
            not MentorSession.is_cancelled,
        )
    ).one()

    # Get upcoming sessions count (future sessions that are active)
    upcoming_sessions = session.exec(
        select(sa.func.count(MentorSession.id)).where(
            MentorSession.mentor_id == mentor_id,
            MentorSession.is_active,
            not MentorSession.is_cancelled,
            MentorSession.start_time > now,
        )
    ).one()

    past_sessions = session.exec(
        select(sa.func.count(MentorSession.id)).where(
            MentorSession.mentor_id == mentor_id, MentorSession.end_time <= now
        )
    ).one()

    # Get total sessions (all time - from cached field)
    # This is the cached value, updated via update_mentor_cached_stats
    total_sessions_created = profile.total_sessions

    # Calculate totals
    total_bookings = sum(bookings_by_status.values())

    # Active bookings (taking up capacity)
    active_bookings = (
        # bookings_by_status[BookingStatus.PENDING] +
        bookings_by_status[BookingStatus.CONFIRMED]
    )

    # All cancellations combined
    total_cancelled = (
        bookings_by_status[BookingStatus.CANCELLED_BY_MENTEE]
        + bookings_by_status[BookingStatus.CANCELLED_BY_MENTOR]
        + bookings_by_status[BookingStatus.EXPIRED]
    )

    # All no-shows combined
    total_no_shows = (
        bookings_by_status[BookingStatus.NO_SHOW_MENTEE]
        + bookings_by_status[BookingStatus.NO_SHOW_MENTOR]
    )

    # Calculate rates (avoid division by zero)
    completion_rate = 0.0
    cancellation_rate = 0.0
    no_show_rate = 0.0

    if total_bookings > 0:
        completion_rate = round(
            (bookings_by_status[BookingStatus.COMPLETED] / total_bookings) * 100, 2
        )
        cancellation_rate = round((total_cancelled / total_bookings) * 100, 2)
        no_show_rate = round((total_no_shows / total_bookings) * 100, 2)

    return {
        # Profile completion
        "completion_percentage": profile.completion_percentage,
        "is_complete": profile.is_mentor_profile_complete,
        # Session stats
        "total_sessions": total_sessions_created,
        "active_sessions": active_sessions or 0,
        "upcoming_sessions": upcoming_sessions or 0,
        "past_sessions": past_sessions or 0,
        # Booking stats - totals
        "total_bookings": total_bookings,
        "active_bookings": active_bookings,
        # Booking stats - by status (detailed)
        "pending_bookings": bookings_by_status[BookingStatus.PENDING],
        "confirmed_bookings": bookings_by_status[BookingStatus.CONFIRMED],
        "completed_bookings": bookings_by_status[BookingStatus.COMPLETED],
        # Cancellation stats (grouped)
        "total_cancelled": total_cancelled,
        "cancelled_by_mentee": bookings_by_status[BookingStatus.CANCELLED_BY_MENTEE],
        "cancelled_by_mentor": bookings_by_status[BookingStatus.CANCELLED_BY_MENTOR],
        "expired_bookings": bookings_by_status[BookingStatus.EXPIRED],
        # No-show stats (grouped)
        "total_no_shows": total_no_shows,
        "no_show_mentee": bookings_by_status[BookingStatus.NO_SHOW_MENTEE],
        "no_show_mentor": bookings_by_status[BookingStatus.NO_SHOW_MENTOR],
        # Calculated metrics
        "completion_rate": completion_rate,
        "cancellation_rate": cancellation_rate,
        "no_show_rate": no_show_rate,
        # Mentee stats
        "total_mentees": unique_mentees or 0,
        # Rating
        "average_rating": profile.average_rating,
    }


def update_mentor_cached_stats(session: Session, mentor_id: int) -> MentorProfile:
    """
    Update cached stats on mentor profile
    Call this after:
    - Creating/deleting sessions
    - Booking status changes to CONFIRMED/COMPLETED

    Updates:
    - total_sessions: Total number of sessions ever created
    - total_mentees: Unique mentees who have confirmed/completed bookings
    """
    profile = get_mentor_profile_or_404(session, mentor_id)

    # Update total sessions
    total_sessions = session.exec(
        select(sa.func.count(MentorSession.id)).where(
            MentorSession.mentor_id == mentor_id
        )
    ).one()

    # Update total unique mentees (only confirmed/completed bookings)
    unique_mentees = session.exec(
        select(sa.func.count(sa.distinct(MentorSessionBooking.mentee_id)))
        .join(MentorSession)
        .where(
            MentorSession.mentor_id == mentor_id,
            MentorSessionBooking.status.in_(
                [BookingStatus.CONFIRMED, BookingStatus.COMPLETED]
            ),
        )
    ).one()

    # Update profile
    profile.total_sessions = total_sessions or 0
    profile.total_mentees = unique_mentees or 0
    profile.updated_at = datetime.now(timezone.utc)

    session.add(profile)
    session.commit()
    session.refresh(profile)

    return profile


# MENTOR SESSIONS
def get_mentor_session(session: Session, session_id: int) -> MentorSession | None:
    return session.get(MentorSession, session_id)


def get_mentor_session_or_404(session: Session, session_id: int) -> MentorSession:
    session_obj = get_mentor_session(session, session_id)
    if not session_obj:
        raise HTTPException(status_code=404, detail="Mentor session not found")
    return session_obj


def get_mentor_session_or_404_by_uuid(
    session: Session, session_uuid: UUID
) -> MentorSession:
    mentor_session = session.exec(
        select(MentorSession).where(MentorSession.uuid == session_uuid)
    ).first()

    if not mentor_session:
        raise HTTPException(status_code=404, detail="Session not found")

    return mentor_session


def get_mentor_sessions(
    session: Session, mentor_id: int, current_user_id: Optional[int] = None
) -> list[MentorSession]:
    """
    Get sessions for a specific mentor:
    - Mentor sees all their sessions
    - Others see public sessions or private sessions they booked
    Only active and non-cancelled sessions are returned.
    """
    query = select(MentorSession).options(selectinload(MentorSession.bookings))
    query = query.where(MentorSession.mentor_id == mentor_id)

    if current_user_id != mentor_id:
        query = query.where(
            sa.or_(
                MentorSession.is_public,
                MentorSession.bookings.any(
                    MentorSessionBooking.mentee_id == current_user_id
                ),
            )
        )

    query = query.where(MentorSession.is_active, not MentorSession.is_cancelled)

    return list(session.exec(query).all())


def get_public_sessions(
    session: Session,
    current_user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[MentorSession]:
    """
    Get sessions visible to the user:
    - Public sessions
    - Private sessions booked by the user
    - User's own sessions
    Only active and non-cancelled sessions are returned.
    """
    query = select(MentorSession).options(selectinload(MentorSession.bookings))

    # Privacy filters
    if current_user_id:
        query = query.where(
            sa.or_(
                MentorSession.is_public,
                MentorSession.mentor_id == current_user_id,
                MentorSession.bookings.any(
                    MentorSessionBooking.mentee_id == current_user_id
                ),
            )
        )
    else:
        query = query.where(MentorSession.is_public)

    # Only active and non-cancelled sessions
    query = query.where(MentorSession.is_active, not MentorSession.is_cancelled)

    return list(session.exec(query.offset(skip).limit(limit)).all())


def get_all_mentor_sessions(
    session: Session, mentor_id: int, active_only: bool = False
) -> List[MentorSession]:
    """Eager load the bookings"""
    query = (
        select(MentorSession)
        .where(MentorSession.mentor_id == mentor_id)
        .options(selectinload(MentorSession.bookings))
    )

    if active_only:
        query = query.where(MentorSession.is_active)

    return list(session.exec(query).all())


def get_featrued_sessions(session: Session, limit: int = 20) -> List[MentorSession]:
    """Get featured mentor sessions (earliest created, active only)"""
    # TODO: Later replace with popularity mentrics or eplicit featured flag
    return list(
        session.exec(
            select(MentorSession)
            .where(MentorSession.is_active and MentorSession.is_public)
            .options(selectinload(MentorSession.bookings))
            .order_by(MentorSession.created_at.asc())
            .limit(limit)
        ).all()
    )


def list_public_sessions(
    *,
    session,
    session_type: str | None = None,
    location_type: str | None = None,
    tag: str | None = None,
    mentor_expertise: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    min_duration: int | None = None,
    max_duration: int | None = None,
    from_time=None,
    to_time=None,
    only_available: bool = False,
    limit: int = 20,
    offset: int = 0,
):
    query = (
        select(MentorSession)
        .join(MentorProfile, MentorSession.mentor_id == MentorProfile.user_id)
        .join(MentorSettings, MentorSettings.mentor_id == MentorProfile.user_id)
        .where(
            MentorSession.is_public,
            MentorSession.is_active,
            MentorSession.is_cancelled,
            MentorSettings.profile_visibility,
            MentorSettings.currently_open_to_mentees,
        )
    )

    # --- Filters ---
    if session_type:
        query = query.where(MentorSession.session_type == session_type)

    if location_type:
        query = query.where(MentorSession.location_type == location_type)

    if tag:
        query = query.where(MentorSession.tags.any(tag))

    if mentor_expertise:
        query = query.where(MentorProfile.expertise.any(mentor_expertise))

    if min_price is not None:
        query = query.where(MentorSession.price_usd >= min_price)

    if max_price is not None:
        query = query.where(MentorSession.price_usd <= max_price)

    if min_duration is not None:
        query = query.where(MentorSession.duration_minutes >= min_duration)

    if max_duration is not None:
        query = query.where(MentorSession.duration_minutes <= max_duration)

    if from_time:
        query = query.where(MentorSession.start_time >= from_time)

    if to_time:
        query = query.where(MentorSession.end_time <= to_time)

    # Filter out full sessions
    if only_available:
        query = query.where(
            (MentorSession.max_bookings.is_(None)) | (MentorSession.max_bookings > 0)
        )

    query = query.order_by(MentorSession.start_time.asc()).offset(offset).limit(limit)

    return session.exec(query).all()


def create_mentor_session(
    session: Session, session_in: MentorSessionCreate
) -> MentorSession:
    # Convert the Pydantic model to dictionary
    session_data = session_in.model_dump()

    # Convert session_type to string if it's an enum
    session_type = session_data.get("session_type")
    if isinstance(session_type, Enum):
        session_data["session_type"] = session_type.value
    else:
        session_data["session_type"] = str(session_type)

    session_obj = MentorSession(**session_data)

    session.add(session_obj)
    session.commit()
    session.refresh(session_obj)

    # update cached stats
    update_mentor_cached_stats(session, session_in.mentor_id)

    return session_obj


def update_mentor_session(
    session: Session, session_id: int, session_in: MentorSessionUpdate
) -> MentorSession:
    session_obj = get_mentor_session_or_404(session, session_id)

    update_data = session_in.model_dump(exclude_unset=True)
    if "session_type" in update_data:
        if hasattr(update_data["session_type"], "value"):
            # It's an enum, get the value
            update_data["session_type"] = update_data["session_type"].value
        else:
            # It's already a string, use as-is
            update_data["session_type"] = update_data["session_type"]

    for key, value in update_data.items():
        setattr(session_obj, key, value)

    now = datetime.now(timezone.utc)

    if session_obj.end_time <= now or session_obj.is_cancelled:
        raise HTTPException(status_code=400, detail="Cannot modify a past session")

    # TODO: Send Notification to mentees for any updates
    session.add(session_obj)
    session.commit()
    session.refresh(session_obj)
    return session_obj


def cancel_mentor_sessions(session: Session, session_id: int) -> None:
    session_obj = get_mentor_session_or_404(session, session_id)

    session_obj.is_cancelled = True
    session_obj.is_active = False
    session_obj.updated_at = datetime.now(timezone.utc)

    session.add(session_obj)
    session.commit()

    # update the cached stats
    update_mentor_cached_stats(session, session_obj.mentor_id)


def delete_mentor_session(session: Session, session_id: int) -> None:
    session_obj = get_mentor_session_or_404(session, session_id)
    mentor_id = session_obj.mentor_id

    session.delete(session_obj)
    session.commit()

    # update the cached stats
    update_mentor_cached_stats(session, mentor_id)


# MENTOR SERVICES
def get_mentor_service(session: Session, service_id: int) -> MentorService | None:
    return session.get(MentorService, service_id)


def get_mentor_service_or_404(session: Session, service_id: int) -> MentorService:
    service_obj = get_mentor_service(session, service_id)
    if not service_obj:
        raise HTTPException(status_code=404, detail="Mentor service not found")
    return service_obj


def list_services_by_mentor(
    session: Session, mentor_id: int, active_only: bool = True
) -> List[MentorService]:
    query = session.query(MentorService).filter(MentorService.mentor_id == mentor_id)
    if active_only:
        query = query.where(MentorService.is_active)
    return list(query.all())


def get_featured_services(session: Session, limit: int = 20) -> List[MentorService]:
    """Get Features mentor services (earliest created, active only)"""
    # TODO: Later replace with popularity metrwics or explicit 'featured' flag
    return list(
        session.exec(
            select(MentorService)
            .where(MentorService.is_active)
            .order_by(MentorService.created_at.asc())
            .limit(limit)
        ).all()
    )


def list_public_services(
    *,
    session,
    category: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    limit: int = 20,
    offset: int = 0,
):
    query = (
        select(MentorService)
        .join(MentorProfile, MentorService.mentor_id == MentorProfile.user_id)
        .join(MentorSettings, MentorSettings.mentor_id == MentorProfile.user_id)
        .where(
            MentorService.is_active,
            MentorSettings.profile_visibility,
            MentorSettings.currently_open_to_mentees,
        )
    )

    if category:
        query = query.where(MentorService.category == category)

    if min_price is not None:
        query = query.where(MentorService.price_usd >= min_price)

    if max_price is not None:
        query = query.where(MentorService.price_usd <= max_price)

    query = query.order_by(MentorService.created_at.desc()).offset(offset).limit(limit)

    return session.exec(query).all()


def create_mentor_service(
    session: Session, service_in: MentorServiceCreate
) -> MentorService:
    service_obj = MentorService.model_validate(service_in)
    session.add(service_obj)
    session.commit()
    session.refresh(service_obj)
    return service_obj


def update_mentor_service(
    session: Session, service_id: int, service_in: MentorServiceUpdate
) -> MentorService:
    service_obj = get_mentor_service_or_404(session, service_id)
    for key, value in service_in.dict(exclude_unset=True).items():
        setattr(service_obj, key, value)
    session.add(service_obj)
    session.commit()
    session.refresh(service_obj)
    return service_obj


def delete_mentor_service(session: Session, service_id: int) -> None:
    service_obj = get_mentor_service_or_404(session, service_id)
    session.delete(service_obj)
    session.commit()


def validate_session_booking(
    session: Session,
    mentor_session: MentorSession,
    mentee_id: int,
    message: Optional[str] = None,
) -> None:
    """
    Validate all business rules for booking a session
    Raises HTTPException if any rule is violated
    """
    now = datetime.now(timezone.utc)

    # Rule 1: Session must be active
    if not mentor_session.is_active:
        raise HTTPException(
            status_code=400, detail="This session is not availble for booking"
        )

    start_time = mentor_session.start_time
    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)

    # Rule 2: Session not expried
    if start_time <= now:
        raise HTTPException(
            status_code=400, detail="This session has already started or passed"
        )

    # Rule 3: Not Cancelled
    if mentor_session.is_cancelled:
        raise HTTPException(status_code=400, detail="This session has been cancelled")

    # Rule 4. Cannot book own Session
    if mentor_session.mentor_id == mentee_id:
        raise HTTPException(status_code=400, detail="You cannot book your own session")

    # Rule 5: Check max bookings
    if mentor_session.max_bookings is not None:
        existing_bookings_count = session.exec(
            select(sa.func.count(MentorSessionBooking.id)).where(
                MentorSessionBooking.session_id == mentor_session.id,
                MentorSessionBooking.status.in_(
                    [BookingStatus.PENDING, BookingStatus.CONFIRMED]
                ),
            )
        ).one()

        if existing_bookings_count >= mentor_session.max_bookings:
            raise HTTPException(status_code=400, detail="This session is fully booked")

    # Check if mentee already has a booking for this session
    existing_booking = session.exec(
        select(MentorSessionBooking).where(
            MentorSessionBooking.session_id == mentor_session.id,
            MentorSessionBooking.mentee_id == mentee_id,
            MentorSessionBooking.status != BookingStatus.CANCELLED_BY_MENTEE,
        )
    ).first()

    if existing_booking:
        raise HTTPException(
            status_code=400, detail="You already have a booking for this session"
        )

    # Rule 6. Check mentor settings
    mentor_settings = get_mentor_settings_or_404(session, mentor_session.mentor_id)

    if mentor_settings.require_intro_message and not message:
        raise HTTPException(
            status_code=400,
            detail="This mentor requires an introduction message with your booking request",
        )

    if not mentor_settings.currently_open_to_mentees:
        raise HTTPException(
            status_code=400,
            detail="This mentor is not currently accepting new bookings",
        )


# BOOKINGS

# BOOKING STATE TRANSITIONS
ALLOWED_STATUS_TRANSITIONS = {
    BookingStatus.PENDING: [
        BookingStatus.CONFIRMED,
        BookingStatus.CANCELLED_BY_MENTEE,
        BookingStatus.CANCELLED_BY_MENTOR,
        BookingStatus.EXPIRED,
    ],
    BookingStatus.CONFIRMED: [
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED_BY_MENTEE,
        BookingStatus.CANCELLED_BY_MENTOR,
        BookingStatus.NO_SHOW_MENTEE,
        BookingStatus.NO_SHOW_MENTOR,
    ],
    BookingStatus.COMPLETED: [],  # Final state
    BookingStatus.CANCELLED_BY_MENTEE: [],  # Final state
    BookingStatus.CANCELLED_BY_MENTOR: [],  # Final state
    BookingStatus.NO_SHOW_MENTEE: [],  # Final state
    BookingStatus.NO_SHOW_MENTOR: [],  # Final state
    BookingStatus.EXPIRED: [],  # Final state
}

# Statuses that count toward session capacity
ACTIVE_BOOKING_STATUSES = [BookingStatus.PENDING, BookingStatus.CONFIRMED]

# Statuses that count as "attended" for analytics
ATTENDED_STATUSES = [BookingStatus.COMPLETED]

# Statuses that are cancellations
CANCELLED_STATUSES = [
    BookingStatus.CANCELLED_BY_MENTEE,
    BookingStatus.CANCELLED_BY_MENTOR,
    BookingStatus.EXPIRED,
]


def validate_status_transition(
    current_status: BookingStatus,
    new_status: BookingStatus,
    is_mentor: bool,
    is_mentee: bool,
) -> None:
    """
    Validate if a status transition is allowed based on current status and user role
    Raises HTTPException if not allowed
    """
    allowed_transitions = ALLOWED_STATUS_TRANSITIONS.get(current_status, [])

    if new_status not in allowed_transitions:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot change status from {current_status} to {new_status.value}",
        )
    # Permission checks

    if new_status == BookingStatus.CONFIRMED and not is_mentor:
        raise HTTPException(status_code=403, detail="Only mentors can confirm bookings")

    if new_status == BookingStatus.CANCELLED_BY_MENTOR and not is_mentor:
        raise HTTPException(
            status_code=403, detail="Only mentors can cancel bookings on their behalf"
        )

    if new_status == BookingStatus.CANCELLED_BY_MENTEE and not is_mentee:
        raise HTTPException(
            status_code=403, detail="Only mentees can cancel their own bookings"
        )

    if (
        new_status in [BookingStatus.NO_SHOW_MENTEE, BookingStatus.NO_SHOW_MENTOR]
        and not is_mentor
    ):
        raise HTTPException(status_code=403, detail="Only mentors can mark no-shows")


def create_session_booking(
    session: Session, session_id: int, mentee_id: int, message: Optional[str] = None
) -> MentorSessionBooking:
    """
    Create a booking for a mentor session after validation
    Updates cached stats if booking is auto-confirmed
    """
    # Get the session
    mentor_session = get_mentor_session_or_404(session, session_id)

    # Validate all the business rules
    validate_session_booking(session, mentor_session, mentee_id, message)

    # Get mentor settings for auto-accept
    mentor_settings = get_mentor_settings_or_404(session, mentor_session.mentor_id)

    # Determine inital status
    initial_status = (
        BookingStatus.CONFIRMED
        if mentor_settings.auto_accept_bookings
        else BookingStatus.PENDING
    )

    # Create the booking
    booking = MentorSessionBooking(
        session_id=session_id,
        mentee_id=mentee_id,
        status=BookingStatus.CONFIRMED
        if mentor_settings.auto_accept_bookings
        else BookingStatus.PENDING,
        message=message,
        # No need to pass "created_at" & "updated_at" fields. The are automatically handles by the Pydantic Models
    )

    session.add(booking)
    session.commit()
    session.refresh(booking)

    # Update cached stats if auto-confirmed
    if initial_status == BookingStatus.CONFIRMED:
        update_mentor_cached_stats(session, mentor_session.mentor_id)

    return booking


# TODO: Send notification on status change
# TODO: Track booking modification history
# TODO: Prevent cancel if session already started


def get_booking_or_404(session: Session, booking_id: int) -> MentorSessionBooking:
    """Get a booking by ID or raise 404"""
    booking = session.get(MentorSessionBooking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


def get_user_bookings(
    session: Session, user_id: int, status: Optional[BookingStatus] = None
) -> list[MentorSessionBooking]:
    """
    Get bookings where this user is the mentee.
    - Mentees can see their own bookings
    """
    query = (
        select(MentorSessionBooking)
        .join(MentorSession)
        .where(MentorSessionBooking.mentee_id == user_id)
    )

    if status:
        query = query.where(MentorSessionBooking.status == status)

    return list(session.exec(query).all())


def get_all_mentor_bookings(
    session: Session, user_id: int, status: Optional[BookingStatus] = None
) -> list[MentorSessionBooking]:
    """
    Get bookings for a mentor's sessions
    - Mentor can see all bookings for their sessions
    """
    query = (
        select(MentorSessionBooking)
        .join(MentorSession)
        .where(sa.or_(MentorSession.mentor_id == user_id))
    )

    if status:
        query = query.where(MentorSessionBooking.status == status)

    return list(session.exec(query).all())


def update_booking_status(
    session: Session, booking_id: int, new_status: BookingStatus, user_id: int
) -> MentorSessionBooking:
    """
    Update booking status with permission checks:
    - Validates state transitions
    - Enforces permission checks
    - Updates cached stats appropriately
    - Keeps all bookings in DB for audit trail
    - Records cancellation reasons
    - Mentors can confirm/cancel bookings for their sessions
    - Mentees can only cancel their own bookings
    - Updates cached stats when status changes to CONFIRMED or COMPLETED
    """
    booking = get_booking_or_404(session, booking_id)
    old_status = booking.status

    # Don't allow updates to final states
    if old_status in [
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED_BY_MENTEE,
        BookingStatus.CANCELLED_BY_MENTOR,
        BookingStatus.NO_SHOW_MENTEE,
        BookingStatus.NO_SHOW_MENTOR,
        BookingStatus.EXPIRED,
    ]:
        raise HTTPException(
            status_code=400, detail=f"Cannot modify bookings in {old_status} state"
        )

    # Get the session to check ownership
    mentor_session = get_mentor_session_or_404(session, booking.session_id)

    # Permission check
    is_mentor = mentor_session.mentor_id == user_id
    is_mentee = booking.mentee_id == user_id

    # Mentee permissions: they can only CANCEL
    if not (is_mentor or is_mentee):
        raise HTTPException(
            status_code=403, detail="Not authorized to update this booking"
        )

    # Validate status transition
    validate_status_transition(old_status, new_status, is_mentor, is_mentee)

    # Update booking's status
    booking.status = new_status
    booking.updated_at = datetime.now(timezone.utc)

    session.add(booking)
    session.commit()
    session.refresh(booking)

    # Update cached stats only for active status changes
    old_was_active = old_status in ACTIVE_BOOKING_STATUSES
    new_is_active = new_status in ACTIVE_BOOKING_STATUSES
    if old_was_active != new_is_active:
        update_mentor_cached_stats(session, mentor_session.mentor_id)

    # TODO: Send notifications
    # - Notify mentee when mentor confirms/denies
    # - Notify mentor when mentee cancels
    # - Send reminder emails before session
    return booking


def delete_booking(session: Session, booking_id: int, user_id: int) -> None:
    """
    Delete a booking with permission checks
    - Mentees can delete their own bookings
    - Mentors can delete bookings for their sessions
    """
    booking = get_booking_or_404(session, booking_id)

    # Get the session to check ownership
    mentor_session = get_mentor_session_or_404(session, booking.session_id)
    mentor_id = mentor_session.mentor_id

    # Permission check
    is_mentor = mentor_session.mentor_id == user_id
    is_mentee = booking.mentee_id == user_id

    if not (is_mentor or is_mentee):
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this booking"
        )

    was_active = booking.status in [BookingStatus.CONFIRMED, BookingStatus.COMPLETED]

    session.delete(booking)
    session.commit()

    if was_active:
        update_mentor_cached_stats(session, mentor_id)


# TODO:// Run this as a daily cron job
def cancel_expired_pending_bookings(session: Session) -> int:
    """
    Immediately cancel all PENDING bookings for sessions that have ended.
    """
    now = datetime.now(timezone.utc)

    pending = session.exec(
        select(MentorSessionBooking)
        .join(MentorSession)
        .where(MentorSessionBooking.status == BookingStatus.PENDING)
        .where(MentorSession.end_time < now)
    ).all()

    count = 0
    for booking in pending:
        booking.status = BookingStatus.CANCELLED_BY_SYSTEM
        booking.updated_at = now
        session.add(booking)

        mentor_session = get_mentor_session_or_404(session, booking.session_id)
        update_mentor_cached_stats(session, mentor_session.mentor_id)

        count += 1

    session.commit()
    return count


def create_board_from_llm(
    session: Session,
    llm_data: BoardCreate,
    owner_id: int,
    roadmap_id: Optional[int] = None,
    goal_id: Optional[int] = None,
    cards_data: Optional[List[Dict]] = None,
) -> Tuple[Board, int]:
    """Create board with default lists and cards from LLM output"""

    if not llm_data.title:
        raise HTTPException(status_code=422, detail="Board title is required")

    # 1. Create the board using pydantic model attr
    board = Board(
        title=llm_data.title,
        description=llm_data.description or "",
        owner_id=owner_id,
        roadmap_id=roadmap_id,
        goal_id=goal_id,
        is_llm_generated=True,
        # If BoardCreate has metafield, use it else just have empy dict
        llm_metadata=getattr(llm_data, "metadata", {}),
    )
    session.add(board)
    session.flush()  # Get board id without commiting

    # 2. Create default lists (Backlog, To Do, etc.)
    default_definitions = [
        ("Backlog", CardStatus.BACKLOG),
        ("To Do", CardStatus.TODO),
        ("In Progress", CardStatus.IN_PROGRESS),
        ("Done", CardStatus.DONE),
        ("Blocked", CardStatus.BLOCKED),
    ]

    # Map from status to actual created list ID
    status_to_list_id = {}
    board_lists = []

    for position, (title, status) in enumerate(default_definitions):
        board_list = BoardList(
            title=title,
            status=status,
            position=position,
            board_id=board.id,
            is_llm_generated=True,
        )
        session.add(board_list)
        board_lists.append(board_list)
        status_to_list_id[status] = board_list.id

    # Flush to get all list IDs
    session.flush()

    # Create mapping after flush
    for board_list in board_lists:
        status_to_list_id[board_list.status] = board_list.id

    session.commit()

    # 3. Create cards (all cards go in Backlog by default)
    total_cards_created = 0
    if cards_data:
        backlog_list_id = status_to_list_id.get(CardStatus.BACKLOG)
        if backlog_list_id:
            created_cards = create_cards_from_llm(
                session=session,
                cards_data=cards_data,  # This is now a flat list
                created_by_id=owner_id,
                roadmap_id=roadmap_id,
                goal_id=goal_id,
                list_id=backlog_list_id,
            )
            total_cards_created = len(created_cards)

    session.commit()
    session.refresh(board)
    return board, total_cards_created


def create_roadmap_from_llm(
    session: Session,
    llm_data: Union[Dict, RoadCreate],
    owner_id: int,
    # goal_id: Optional[int] = None
) -> Roadmap:
    """Create roadmap from LLM output with full validation"""
    if hasattr(llm_data, "model_dump"):
        llm_data = llm_data.model_dump()

    if not llm_data.get("title"):
        raise HTTPException(status_code=422, detail="Roadmap title is required")

    # Validate dates if provided
    start_date = llm_data.get("start_date")
    target_date = llm_data.get("target_date")
    if start_date and target_date and start_date > target_date:
        raise HTTPException(
            status_code=422, detail="Start date cannot be after target date"
        )

    roadmap = Roadmap(
        title=llm_data["title"],
        description=llm_data.get("description", ""),
        visibility=llm_data.get("visibility", "private"),
        status=llm_data.get("status", "draft"),
        tags=llm_data.get("tags", []),
        start_date=start_date,
        target_date=target_date,
        owner_id=owner_id,
        # goal_id=goal_id, # NOTE roadmap does not need to point to the goals.
        is_llm_generated=True,
        llm_metadata=llm_data.get("metadata", {}),
    )

    session.add(roadmap)
    session.commit()
    session.refresh(roadmap)
    return roadmap


def create_cards_from_llm(
    session: Session,
    cards_data: List[Union[Dict, CardCreate]],
    created_by_id: int,
    roadmap_id: Optional[int] = None,
    goal_id: Optional[int] = None,
    list_id: Optional[int] = None,
) -> List[Card]:
    """Batch create validated cards from LLM output"""
    if not list_id:
        raise HTTPException(
            status_code=422, detail="list_id is required for card creation"
        )

    processed_cards = []
    for card_data in cards_data:
        if hasattr(card_data, "model_dump"):
            processed_cards.append(card_data.model_dump())
        else:
            processed_cards.append(card_data)

    created_cards = []
    for position, card_data in enumerate(processed_cards):
        try:
            # Validate status
            status = card_data.get("status", "todo")
            try:
                CardStatus(status)
            except ValueError:
                status = "todo"

            # Validate PRIORITY
            priority = card_data.get("priority", "medium")
            try:
                CardPriority(priority)
            except ValueError:
                priority = CardPriority.MEDIUM

            card = Card(
                title=card_data.get("title", "New Task"),
                description=card_data.get("description", ""),
                status=status,
                priority=priority,
                position=card_data.get(
                    "position", position
                ),  # Using enumarated position as fallback
                tags=card_data.get("tags", []),
                due_date=card_data.get("due_date"),
                estimated_duration=card_data.get("estimated_duration"),
                list_id=list_id,
                goal_id=goal_id,
                roadmap_id=roadmap_id,
                created_by_id=created_by_id,
                is_llm_generated=True,
            )
            session.add(card)
            created_cards.append(card)
        except Exception as e:
            llm_logger.error(f"Failed to create card: {e}")
            continue

    if created_cards:  # Only commmit if there are cards to save.
        session.commit()
    return created_cards


def create_goal_from_llm(
    session: Session,
    llm_data: Union[Dict, GoalCreate],
    owner_id: int,
    roadmap_id: Optional[int] = None,
    parent_goal_id: Optional[int] = None,
) -> Goal:
    """Create goal from LLM output with full validation"""
    if hasattr(llm_data, "model_dump"):
        llm_data = llm_data.model_dump()

    if not llm_data.get("title"):
        raise HTTPException(status_code=422, detail="Goal title is required")

    # Validate dates
    start_date = llm_data.get("start_date")
    target_date = llm_data.get("target_date")
    if start_date and target_date and start_date > target_date:
        raise HTTPException(
            status_code=422, detail="Start date cannot be after target date"
        )

    # Validate difficulty
    difficulty = llm_data.get("difficulty", "easy")
    try:
        GoalDifficulty(difficulty)
    except ValueError:
        difficulty = "easy"

    # Validate goal type
    goal_type = llm_data.get("type", "skill")
    try:
        GoalType(goal_type)
    except ValueError:
        goal_type = "skill"

    goal = Goal(
        title=llm_data["title"],
        description=llm_data.get("description", ""),
        type=goal_type,
        difficulty=difficulty,
        importance=llm_data.get("importance", 1),
        tags=llm_data.get("tags", []),
        start_date=start_date,
        target_date=target_date,
        owner_id=owner_id,
        roadmap_id=roadmap_id,
        parent_goal_id=parent_goal_id,
        is_llm_generated=True,
        llm_metadata=llm_data.get("metadata", {}),
    )

    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal


def get_llm_generated_entities(
    session: Session, user_id: int, limit: int = 100
) -> Dict[str, List]:
    """Get all LLM-generated entities for a user"""
    roadmaps = session.exec(
        select(Roadmap)
        .where(Roadmap.owner_id == user_id)
        .where(Roadmap.is_llm_generated)
        .limit(limit)
    ).all()

    goals = session.exec(
        select(Goal)
        .where(Goal.owner_id == user_id)
        .where(Goal.is_llm_generated)
        .limit(limit)
    ).all()

    cards = session.exec(
        select(Card)
        .where(Card.created_by_id == user_id)
        .where(Card.is_llm_generated)
        .limit(limit)
    ).all()

    return {"roadmaps": roadmaps, "goals": goals, "cards": cards}


# ==================== GOAL CRUD FUNCTIONS ====================


def update_goal(session: Session, goal_id: int, goal_in: GoalUpdate) -> Goal:
    """Update a goal"""
    goal = session.get(Goal, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    update_data = goal_in.model_dump(exclude_unset=True)

    # Handle enum conversion for status
    if "status" in update_data:
        from app.models.enums import GoalStatus

        if isinstance(update_data["status"], str):
            update_data["status"] = GoalStatus(update_data["status"])

    # Handle enum conversion for difficulty
    if "difficulty" in update_data:
        if isinstance(update_data["difficulty"], str):
            update_data["difficulty"] = GoalDifficulty(update_data["difficulty"])

    for key, value in update_data.items():
        setattr(goal, key, value)

    goal.updated_at = datetime.now(timezone.utc)
    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal


def get_goal(session: Session, goal_id: int) -> Goal | None:
    """Get a goal by ID"""
    return session.get(Goal, goal_id)


def get_goal_or_404(session: Session, goal_id: int) -> Goal:
    """Get a goal by ID or raise 404"""
    goal = get_goal(session, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


# ==================== ROADMAP CRUD FUNCTIONS ====================


def update_roadmap(
    session: Session, roadmap_id: int, roadmap_in: RoadmapUpdate
) -> Roadmap:
    """Update a roadmap"""
    roadmap = session.get(Roadmap, roadmap_id)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    update_data = roadmap_in.model_dump(exclude_unset=True)

    # Handle enum conversions
    if "visibility" in update_data:
        from app.models.enums import RoadmapVisibility

        if isinstance(update_data["visibility"], str):
            update_data["visibility"] = RoadmapVisibility(update_data["visibility"])

    if "status" in update_data:
        from app.models.enums import RoadmapStatus

        if isinstance(update_data["status"], str):
            update_data["status"] = RoadmapStatus(update_data["status"])

    for key, value in update_data.items():
        setattr(roadmap, key, value)

    roadmap.updated_at = datetime.now(timezone.utc)
    session.add(roadmap)
    session.commit()
    session.refresh(roadmap)
    return roadmap


def get_roadmap(session: Session, roadmap_id: int) -> Roadmap | None:
    """Get a roadmap by ID"""
    return session.get(Roadmap, roadmap_id)


def get_roadmap_or_404(session: Session, roadmap_id: int) -> Roadmap:
    """Get a roadmap by ID or raise 404"""
    roadmap = get_roadmap(session, roadmap_id)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap


# ==================== BOARD CRUD FUNCTIONS ====================


def update_board(session: Session, board_id: int, board_in: BoardUpdate) -> Board:
    """Update a board"""
    board = session.get(Board, board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    update_data = board_in.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(board, key, value)

    board.updated_at = datetime.now(timezone.utc)
    session.add(board)
    session.commit()
    session.refresh(board)
    return board


def get_board(session: Session, board_id: int) -> Board | None:
    """Get a board by ID"""
    return session.get(Board, board_id)


def get_board_or_404(session: Session, board_id: int) -> Board:
    """Get a board by ID or raise 404"""
    board = get_board(session, board_id)
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return board


# ==================== CARD CRUD FUNCTIONS ====================


def update_card(session: Session, card_id: int, card_in: CardUpdate) -> Card:
    """Update a card"""
    card = session.get(Card, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")

    update_data = card_in.model_dump(exclude_unset=True)

    # Handle enum conversions
    if "status" in update_data:
        if isinstance(update_data["status"], str):
            update_data["status"] = CardStatus(update_data["status"])

    if "priority" in update_data:
        if isinstance(update_data["priority"], str):
            update_data["priority"] = CardPriority(update_data["priority"])

    for key, value in update_data.items():
        setattr(card, key, value)

    card.updated_at = datetime.now(timezone.utc)
    session.add(card)
    session.commit()
    session.refresh(card)
    return card


def get_card(session: Session, card_id: int) -> Card | None:
    """Get a card by ID"""
    return session.get(Card, card_id)


def get_card_or_404(session: Session, card_id: int) -> Card:
    """Get a card by ID or raise 404"""
    card = get_card(session, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card


def link_card_to_goal(session: Session, card_id: int, goal_id: int) -> Card:
    """Link a card to a goal"""
    card = get_card_or_404(session, card_id)
    goal = get_goal_or_404(session, goal_id)

    card.goal_id = goal_id
    card.updated_at = datetime.now(timezone.utc)

    session.add(card)
    session.commit()
    session.refresh(card)
    return card


def assign_card_to_user(session: Session, card_id: int, user_id: int) -> Card:
    """Assign a card to a user"""
    card = get_card_or_404(session, card_id)
    user = get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    card.assignee_id = user_id
    card.updated_at = datetime.now(timezone.utc)

    session.add(card)
    session.commit()
    session.refresh(card)
    return card


def move_card_to_list(session: Session, card_id: int, list_id: int) -> Card:
    """Move a card to a different list"""
    card = get_card_or_404(session, card_id)
    board_list = session.get(BoardList, list_id)
    if not board_list:
        raise HTTPException(status_code=404, detail="Board list not found")

    card.list_id = list_id
    # Update status to match the list's status if it has one
    if board_list.status:
        card.status = board_list.status
    card.updated_at = datetime.now(timezone.utc)

    session.add(card)
    session.commit()
    session.refresh(card)
    return card


# ==================== BOARD LIST CRUD FUNCTIONS ====================


def get_board_lists(session: Session, board_id: int) -> List[BoardList]:
    """Get all lists for a board"""
    return list(
        session.exec(
            select(BoardList)
            .where(BoardList.board_id == board_id)
            .order_by(BoardList.position)
        ).all()
    )


def get_roadmap_goals(session: Session, roadmap_id: int) -> List[Goal]:
    """Get all goals for a roadmap"""
    return list(
        session.exec(
            select(Goal).where(Goal.roadmap_id == roadmap_id).order_by(Goal.created_at)
        ).all()
    )
