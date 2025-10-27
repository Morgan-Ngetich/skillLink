import sqlalchemy as sa
from fastapi import HTTPException
from typing import List, Dict, Optional, Union, Tuple, Any
from sqlmodel import Session, select
from datetime import datetime, timezone
from sqlalchemy.orm import selectinload
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
    MentorSettings,
    MentorSettingsCreate,
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
    Goal,
    GoalCreate,
    GoalStatus,
    GoalType,
    GoalDifficulty,
    CardCreate,
    Card,
    CardStatus,
    CardPriority,
    Roadmap,
    RoadmapStatus,
    RoadCreate,
)
from app.core.security import get_password_hash, verify_password
from uuid import UUID
from app.utils.logger_config import llm_logger
# from app.utils.logo_fetcher import enrich_with_logos


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
    db_user = User.model_validate(user_in, update={"hashed_password": hashed_password})
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
    for key, value in profile_in.dict(exclude_unset=True).items():
        setattr(profile, key, value)
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile


# MENTOR Settings:
def get_mentor_settings(session: Session, mentor_id: int) -> MentorSettings | None:
    return (
        session.query(MentorSettings)
        .filter(MentorSettings.mentor_id == mentor_id)
        .first()
    )


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
    session: Session, mentor_id: int, settings_in: dict | MentorSettingsCreate
) -> MentorSettings:
    settings = get_mentor_settings_or_404(session, mentor_id)

    update_data = (
        settings_in.dict(exclude_unset=True)
        if hasattr(settings_in, "dict")
        else settings_in
    )

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
    
    # Get unique mentees count (users who have confirmed/completed bookings)
    unique_mentees = session.exec(
        select(sa.func.count(sa.distinct(MentorSessionBooking.mentee_id)))
        .join(MentorSession)
        .where(
            MentorSession.mentor_id == mentor_id,
            MentorSessionBooking.status.in_([
                BookingStatus.CONFIRMED, 
                BookingStatus.COMPLETED
            ])
        )
    ).one()
    
    # Get total bookings by status
    booking_stats = session.exec(
        select(
            MentorSessionBooking.status,
            sa.func.count(MentorSessionBooking.id).label('count')
        )
        .join(MentorSession)
        .where(MentorSession.mentor_id == mentor_id)
        .group_by(MentorSessionBooking.status)
    ).all()


    # Convert to dict for easy access
    bookings_by_status = {
        BookingStatus.PENDING: 0,
        BookingStatus.CONFIRMED: 0,
        BookingStatus.COMPLETED: 0,
        BookingStatus.CANCELLED: 0,
    }
    for status, count in booking_stats:
        bookings_by_status[status] = count
        
    # Get active sessions count
    now = datetime.now(timezone.utc)
    
    active_sessions = session.exec(
        select(sa.func.count(MentorSession.id))
        .where(
            MentorSession.mentor_id == mentor_id,
            MentorSession.is_active,
            not MentorSession.is_cancelled
        )
    ).one()
    
    # Get upcoming sessions count (future sessions)
    upcoming_sessions = session.exec(
        select(sa.func.count(MentorSession.id))
        .where(
            MentorSession.mentor_id == mentor_id,
            MentorSession.is_active,
            not MentorSession.is_cancelled,
            MentorSession.start_time > now
        )
    ).one()
    
    
     # Get total sessions (all time - from cached field)
    # This is the cached value, updated via update_mentor_cached_stats
    total_sessions_created = profile.total_sessions
    
    # Calculate totals
    total_bookings = sum(bookings_by_status.values())
    
    return {
        # Profile completion
        "completion_percentage": profile.completion_percentage,
        "is_complete": profile.is_mentor_profile_complete,
        
        # Session stats
        "total_sessions": total_sessions_created,
        "active_sessions": active_sessions or 0,
        "upcoming_sessions": upcoming_sessions or 0,
        
        # Booking stats
        "total_bookings": total_bookings,
        "confirmed_bookings": bookings_by_status[BookingStatus.CONFIRMED],
        "pending_bookings": bookings_by_status[BookingStatus.PENDING],
        "completed_bookings": bookings_by_status[BookingStatus.COMPLETED],
        "cancelled_bookings": bookings_by_status[BookingStatus.CANCELLED],
        
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
        select(sa.func.count(MentorSession.id))
        .where(MentorSession.mentor_id == mentor_id)
    ).one()
    
    # Update total unique mentees (only confirmed/completed bookings)
    unique_mentees = session.exec(
        select(sa.func.count(sa.distinct(MentorSessionBooking.mentee_id)))
        .join(MentorSession)
        .where(
            MentorSession.mentor_id == mentor_id,
            MentorSessionBooking.status.in_([
                BookingStatus.CONFIRMED,
                BookingStatus.COMPLETED
            ])
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


def get_all_mentor_sessions(
    session: Session, mentor_id: int, active_only: bool = False
) -> List[MentorSession]:
    query = session.query(MentorSession).filter(MentorSession.mentor_id == mentor_id)
    if active_only:
        query = query.filter(MentorSession.is_active)
    return query.all()


def create_mentor_session(
    session: Session, session_in: MentorSessionCreate
) -> MentorSession:
    session_obj = MentorSession.model_validate(session_in)
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
    for key, value in session_in.dict(exclude_unset=True).items():
        setattr(session_obj, key, value)
        
    now = datetime.now(timezone.utc)
    
    # Cannot reschedule past sessions
    if session_obj.start_time <= now:
        raise HTTPException(
            status_code=400, detail="Cannot modify a past session"
        )
    # TODO: notify mentees for anyUpdates.

    session.add(session_obj)
    session.commit()
    session.refresh(session_obj)
    return session_obj


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


def get_all_mentor_services(
    session: Session, mentor_id: int, active_only: bool = True
) -> List[MentorService]:
    query = session.query(MentorService).filter(MentorService.mentor_id == mentor_id)
    if active_only:
        query = query.filter(MentorService.is_active)
    return query.all()


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
                MentorSessionBooking.status.in_([BookingStatus.PENDING, BookingStatus.CONFIRMED])
            )
        ).one()
        
        if existing_bookings_count >= mentor_session.max_bookings:
            raise HTTPException(
                status_code=400,
                detail="This session is fully booked"
            )
    
    # Check if mentee already has a booking for this session
    existing_booking = session.exec(
        select(MentorSessionBooking).where(
            MentorSessionBooking.session_id == mentor_session.id,
            MentorSessionBooking.mentee_id == mentee_id,
            MentorSessionBooking.status != BookingStatus.CANCELLED
        )
    ).first()
    
    if existing_booking:
        raise HTTPException(
            status_code=400,
            detail="You already have a booking for this session"
        )
    
    # Rule 6. Check mentor settings
    mentor_settings = get_mentor_settings_or_404(session, mentor_session.mentor_id)
    
    if mentor_settings.require_intro_message and not message:
        raise HTTPException(
            status_code=400,
            detail="This mentor requires an introduction message with your booking request"
        )
        
    if not mentor_settings.currently_open_to_mentees:
        raise HTTPException(
            status_code=400,
            detail="This mentor is not currently accepting new bookings"
        )
        
        
          


# BOOKINGS
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
        status=BookingStatus.CONFIRMED if mentor_settings.auto_accept_bookings else BookingStatus.PENDING,
        message=message
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
    session: Session,
    user_id: int,
    status: Optional[BookingStatus] = None
) -> list[MentorSessionBooking]:
    """
    Get bookings for a user
    """
    query = (
        select(MentorSessionBooking)
        .join(MentorSession)
        .where(
            sa.or_(
                MentorSessionBooking.mentee_id == user_id,
                MentorSession.mentor_id == user_id
            )
        )
    )

    if status:
        query = query.where(MentorSessionBooking.status == status)

    return list(session.exec(query).all())


def update_booking_status(
    session: Session,
    booking_id: int,
    new_status: BookingStatus,
    user_id: int
) -> MentorSessionBooking:
    """
    Update booking status with permission checks
    - Mentors can confirm/cancel bookings for their sessions
    - Mentees can only cancel their own bookings
    Updates cached stats when status changes to CONFIRMED or COMPLETED
    """
    booking = get_booking_or_404(session, booking_id)
    old_status = booking.status
    
    # Get the session to check ownership
    mentor_session = get_mentor_session_or_404(session, booking.session_id)
    
    # Permission check
    is_mentor = mentor_session.mentor_id == user_id
    is_mentee = booking.mentee_id == user_id
    
    # Mentee permissions: they can only CANCEL
    if not (is_mentor or is_mentee):
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this booking"
        )
    
    # Mentor permissions: cannot revert completed/expired sessions
    if is_mentee and not is_mentor and new_status != BookingStatus.CANCELLED:
        raise HTTPException(
            status_code=403,
            detail="You can only cancel your own bookings"
        )
        
    # Update status
    booking.status = new_status
    booking.updated_at = datetime.now(timezone.utc)
    
    session.add(booking)
    session.commit()
    session.refresh(booking)
    
    # Update cached stats if status changed to/from CONFIRMED or COMPLETED
    status_changed_to_active = new_status in [BookingStatus.CONFIRMED, BookingStatus.COMPLETED]
    status_changed_from_active = old_status in [BookingStatus.CONFIRMED, BookingStatus.COMPLETED]
    
    if status_changed_to_active or status_changed_from_active:
        update_mentor_cached_stats(session, mentor_session.mentor_id)
    
    return booking



def delete_booking(
    session: Session,
    booking_id: int,
    user_id: int
) -> None:
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
            status_code=403,
            detail="Not authorized to delete this booking"
        )
    
    was_active = booking.status in [BookingStatus.CONFIRMED, BookingStatus.COMPLETED]
    
    session.delete(booking)
    session.commit()
    
    if was_active:
        update_mentor_cached_stats(session, mentor_id)
    
    







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
