from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from app.api.deps import SessionDep, CurrentUser
from sqlmodel import select
from app.models import (
    Role,
    UserRole,
    RoleName,
    UserPublic,
    MentorProfile,
    MentorProfileCreate,
    MentorProfilePublic,
    MentorProfileUpdate,
    MentorServicePublic,
    MentorServiceCreate,
    MentorServiceUpdate,
    MentorSessionPublic,
    MentorSession,
    MentorSessionCreate,
    MentorSessionUpdate,
    MentorSessionBooking,
    MentorSettings,
    MentorSettingsPublic,
    MentorSettingsCreate,
    MentorSettingsUpdate,
    BookingStatus,
    BookingStatusUpdate,
    BookingPublic,
    BookingCreateRequest,
    MentorStatsPublic
)
from app import crud
from uuid import UUID

router = APIRouter()


# ================= MENTOR PROFILE ==================
@router.get("/profile", response_model=MentorProfilePublic)
def read_my_mentor_profile(current_user: CurrentUser, session: SessionDep):
    """
    Retrieve CurrentUser's mentor's profile
    """
    profile = crud.get_mentor_profile_or_404(session, current_user.id)
    return profile.to_public()


@router.post("/profile", response_model=MentorProfilePublic)
def create_mentor_profile(
    profile_in: MentorProfileCreate, session: SessionDep, current_user: CurrentUser
):
    """
    Create mentor profile - 1-step onboarding
    This endpoint is called after user completes mentor setup
    """
    if profile_in.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Cannot create mentor profile for another user"
        )

    # Check if user profile is complete
    user_profile = crud.get_user_profile_or_404(session, current_user.id)
    if not user_profile.is_profile_setup_complete:
        raise HTTPException(
            status_code=400,
            detail="Complete user profile setup before creating mentor profile",
        )

    # Create mentor profile
    profile = crud.create_mentor_profile(session, profile_in)

    # Create default mentor settings
    settings_in = MentorSettingsCreate(mentor_id=current_user.id)
    crud.create_mentor_settings(session, settings_in)

    # Assign MENTOR role
    crud.assign_role(session, current_user, RoleName.MENTOR)
    return profile.to_public()


@router.patch("/profile", response_model=MentorProfilePublic)
def update_mentor_profile(
    profile_in: MentorProfileUpdate, session: SessionDep, current_user: CurrentUser
):
    """Update CurrentUser's mentor profile"""
    profile = crud.update_mentor_profile(session, current_user.id, profile_in)
    return profile.to_public()


@router.get("/stats", response_model=dict)
def get_mentor_stats(session: SessionDep, current_user: CurrentUser):
    """
    Get comprehensive mentor dashboard statistics  
    Uses optimized SQL queries to avoid loading full relationships, thus saving memory.
    """
    stats = crud.get_mentor_stats(session, current_user.id)
    return MentorStatsPublic(**stats).model_dump()

@router.post("/stats/refresh", response_model=dict, status_code=200)
def refresh_mentor_cached_stats(session: SessionDep, current_user: CurrentUser):
    """
    Manually refresh cached stats (total_sessions, total_mentees)
    
    Useful for:
    - Manual corrections
    - After bulk operations
    - Debugging inconsistencies
    
    Cached stats are automatically updated after normal CRUD operations
    """
    profile = crud.update_mentor_cached_stats(session, current_user.id)
    
    return {
        "message": "Stats refreshed successfully",
        "total_sessions": profile.total_sessions,
        "total_mentees": profile.total_mentees,
    }


@router.post("/toggle-availability", response_model=MentorProfilePublic)
def toggle_mentor_availability(session: SessionDep, current_user: CurrentUser):
    """
    Toggle mentor's availability (open to mentees on/off)
    Quick toggle endpoint used in mentor dashboard
    """
    settings = crud.get_mentor_settings_or_404(session, current_user.id)
    settings.currently_open_to_mentees = not settings.currently_open_to_mentees

    session.add(settings)
    session.commit()
    session.refresh(settings)

    profile = crud.get_mentor_profile_or_404(session, current_user.id)
    return profile.to_public()


# ================= MENTOR SESSIONS ==================
@router.post("/sessions", response_model=MentorSessionPublic, status_code=201)
def create_mentor_session(
    session_in: MentorSessionCreate, session: SessionDep, current_user: CurrentUser
):
    """Create a new bookable session type"""
    if session_in.mentor_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Cannot create session for another mentor"
        )

    crud.get_mentor_profile_or_404(session, current_user.id)
    mentor_session = crud.create_mentor_session(session, session_in)
    return mentor_session.to_public()


@router.get("/sessions", response_model=List[MentorSessionPublic])
def list_public_sessions(
    session: SessionDep,
    current_user: Optional[CurrentUser] = None,
    skip: int = 0,
    limit: int = 100,
):
    """
    List sessions visible to the current user.
    
    Returns:
    - Public sessions for everyone
    - Private sessions where current user has booked
    - Current user's own sessions
    """
    current_user_id = current_user.id if current_user else None
    sessions = crud.get_public_sessions(
        session, current_user_id=current_user_id, skip=skip, limit=limit
    )
    return [s.to_public(current_user_id=current_user_id) for s in sessions]

# TODO: move this to public routes
@router.get("/sessions/featured", response_model=List[MentorSessionPublic])
def get_featured_sessions(session: SessionDep):
    """
    Public: Get featured mentor sessions (first 20 created, active only).
    Can be used to showcase popular or trending session types on explore page.
    """
    sessions = crud.get_featrued_sessions(session=session, limit=20)
    
    return [s.to_public() for s in sessions]


# TODO: Get the sessions created by mentor, and the sessions, booked by mentees.
# TODO: Right now, we are getting the sessions, created by a mentor. When a mentee books a session, throught the session_id, i get to display the session
@router.get("/sessions/{session_uuid}", response_model=MentorSessionPublic)
def get_session_details(
    session_uuid: UUID,
    session: SessionDep,
    current_user: Optional[CurrentUser] = None,
):
    """
    Get a single session by UUID with privacy checks.
    """
    mentor_session: MentorSession = crud.get_mentor_session_or_404_by_uuid(session, session_uuid)
    current_user_id = current_user.id if current_user else None

    if not mentor_session.is_public:
        if not current_user_id or not mentor_session.can_user_access(current_user_id):
            raise HTTPException(
                status_code=403,
                detail="You don't have access to this private session"
            )

    return mentor_session.to_public(current_user_id=current_user_id)


@router.get("/mentor/{mentor_id}/sessions", response_model=List[MentorSessionPublic])
def get_mentor_sessions_route(
    mentor_id: int,
    session: SessionDep,
    current_user: Optional[CurrentUser] = None,
):
    """
    Get all sessions for a mentor with privacy enforcement.
    """
    current_user_id = current_user.id if current_user else None
    sessions = crud.get_mentor_sessions(
        session, mentor_id=mentor_id, current_user_id=current_user_id
    )
    return [s.to_public(current_user_id=current_user_id) for s in sessions]


@router.patch("/sessions/{session_id}", response_model=MentorSessionPublic)
def update_mentor_session(
    session_id: int,
    session_in: MentorSessionUpdate,
    session: SessionDep,
    current_user: CurrentUser,
):
    """Update a mentor session"""
    mentor_session = crud.get_mentor_session_or_404(session, session_id)
    if mentor_session.mentor_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this session"
        )

    updated = crud.update_mentor_session(session, session_id, session_in)
    return updated.to_public()

@router.patch("/sessions/{session_id}/toggle-public", response_model=MentorSessionPublic)
def toggle_session_public(
    session_id: int,
    session: SessionDep,
    current_user: CurrentUser,
):
    """Toggle session public/private visibility"""
    mentor_session = crud.get_mentor_session_or_404(session, session_id)
    
    if mentor_session.mentor_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this session"
        )
    
    # Toggle the is_public field
    mentor_session.is_public = not mentor_session.is_public
    
    session.add(mentor_session)
    session.commit()
    session.refresh(mentor_session)
    
    return mentor_session.to_public()


@router.delete("/sessions/{session_id}", status_code=204)
def delete_mentor_session(
    session_id: int, session: SessionDep, current_user: CurrentUser
):
    """ Cancel a mentor session (soft delete) """
    mentor_session = crud.get_mentor_session_or_404(session, session_id)
    if mentor_session.mentor_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this session"
        )

    crud.cancel_mentor_sessions(session, session_id)
    return None


# ================= MENTOR SERVICES ==================
@router.post("/services", response_model=MentorServicePublic, status_code=201)
def create_mentor_service(
    service_in: MentorServiceCreate, session: SessionDep, current_user: CurrentUser
):
    """Create a new service showcase card"""
    if service_in.mentor_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Cannot create service for another mentor"
        )

    crud.get_mentor_profile_or_404(session, current_user.id)
    service = crud.create_mentor_service(session, service_in)
    return service.to_public()


@router.get("/services", response_model=list[MentorServicePublic])
def list_my_mentor_services(session: SessionDep, current_user: CurrentUser):
    """List all services for current mentor"""
    services = crud.get_all_mentor_services(session, current_user.id)
    return [s.to_public() for s in services]


@router.patch("/services/{service_id}", response_model=MentorServicePublic)
def update_mentor_service(
    service_id: int,
    service_in: MentorServiceUpdate,
    session: SessionDep,
    current_user: CurrentUser,
):
    """Update a mentor service"""
    service = crud.get_mentor_service_or_404(session, service_id)
    if service.mentor_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this service"
        )

    updated = crud.update_mentor_service(session, service_id, service_in)
    return updated.to_public()


@router.delete("/services/{service_id}", status_code=204)
def delete_mentor_service(
    service_id: int, session: SessionDep, current_user: CurrentUser
):
    """Delete a mentor service"""
    service = crud.get_mentor_service_or_404(session, service_id)
    if service.mentor_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this service"
        )

    crud.delete_mentor_service(session, service_id)
    return None


# ================= MENTOR SETTINGS ==================
@router.get("/settings", response_model=MentorSettingsPublic)
def get_my_mentor_settings(session: SessionDep, current_user: CurrentUser):
    """Retrieve current mentor's settings"""
    settings = crud.get_mentor_settings_or_404(session, current_user.id)
    return settings.to_public()


@router.patch("/settings", response_model=MentorSettingsPublic)
def update_my_mentor_settings(
    settings_in: MentorSettingsUpdate, session: SessionDep, current_user: CurrentUser
):
    """Update current mentor's settings"""
    settings = crud.update_mentor_settings(session, current_user.id, settings_in)
    return settings.to_public()


# TODO: Prevent cancel if session already started
# TODO: Notify mentor + mentee on booking status change
# TODO: Add pagination/filter for bookings list
# TODO: Hide session join link until CONFIRMED
# TODO: Mentor can disable new bookings per session

# TODO (Visibility Controls Roadmap)
# -------------------------------------------------------
# Future improvements for mentor session visibility rules:
#
# ✅ Phase 1 (current):
# - Hide exact start/end time if mentor setting disabled
# - Hide meeting link / physical address until booking confirmed
#
# 🔜 Phase 2 (short-term):
# - Show “availability windows” (e.g. “Wed afternoon”) instead of exact time
# - Allow mentors to choose visibility per session (override global settings)
# - Include timezone in visibility rules
#
# 🛠️ Phase 3 (advanced):
# - Allow mentors to mark sessions as "private invite only"
# - Add visibility tiering (e.g., followers-only exposure)
# - Add reporting to detect unauthorized booking link exposures
#
# 🎯 Phase 4 (growth & monetization):
# - Promote “premium visibility unlocks”
# - Integrate calendar sync (Google/Outlook) for verified mentors
# - Add location verification for physical sessions
#
# NOTE: Ensure changes maintain:
# - Privacy protection by default
# - Low risk of link scraping/spam
# - Clean UX difference between "Public Preview" and "Booked Access"
# -------------------------------------------------------


# ================= SESSION BOOKINGS ==================
@router.post(
    "/sessions/{session_id}/book", response_model=BookingPublic, status_code=201
)
def book_mentor_session(
    session_id: int,
    booking_data: BookingCreateRequest,
    session: SessionDep,
    current_user: CurrentUser,
):
    """
    Book a mentor session as a mentee

    All business rules enforced in crud.create_session_booking():
    - Session must be active, not expired, not cancelled
    - Cannot book own session
    - Max bookings not exceeded
    - Respects mentor's require_intro_message setting
    - Checks mentor availability
    """
    booking = crud.create_session_booking(
        session=session,
        session_id=session_id,
        mentee_id=current_user.id,
        message=booking_data.message,
    )

    return booking.to_public()


@router.get("/bookings", response_model=List[BookingPublic])
def list_my_bookings(
    session: SessionDep,
    current_user: CurrentUser,
    status: Optional[BookingStatus] = Query(None),
):
    """
    List all bookings for the current user
    """
    bookings = crud.get_user_bookings(
        session=session,
        user_id=current_user.id,
        status=status,
    )

    return [b.to_public() for b in bookings]


@router.patch("/bookings/{booking_id}/status", response_model=BookingPublic)
def update_booking_status(
    booking_id: int,
    status_update: BookingStatusUpdate,
    session: SessionDep,
    current_user: CurrentUser,
):
    """
    Update booking status
    - Mentors can confirm/cancel bookings for their sessions
    - Mentees can only cancel their own bookings
    
    Allowed transitions:
    - PENDING -> CONFIRMED (mentor only)
    - PENDING -> CANCELLED_BY_MENTOR (mentor only, with reason)
    - PENDING -> CANCELLED_BY_MENTEE (mentee only)
    - CONFIRMED -> COMPLETED (mentor only)
    - CONFIRMED -> CANCELLED_BY_MENTOR (mentor only, with reason)
    - CONFIRMED -> CANCELLED_BY_MENTEE (mentee only, with reason)
    - CONFIRMED -> NO_SHOW_MENTEE/NO_SHOW_MENTOR (mentor only)
    """
    bookings = crud.update_booking_status(
        session=session,
        booking_id=booking_id,
        new_status=status_update.status,
        user_id=current_user.id,
    )

    return bookings.to_public()

@router.post("/bookings/{booking_id}/confirm", response_model=BookingPublic)
def confirm_booking(
    booking_id: int,
    session: SessionDep,
    current_user: CurrentUser,
):
    """Mentor confirms a pending booking (shortcut endpoint)"""
    return crud.update_booking_status(
        session=session,
        booking_id=booking_id,
        new_status=BookingStatus.CONFIRMED,
        user_id=current_user.id,
    ).to_public()


@router.post("/bookings/{booking_id}/deny", response_model=BookingPublic)
def deny_booking(
    booking_id: int,
    reason: str,
    session: SessionDep,
    current_user: CurrentUser,
):
    """Mentor denies a pending booking with reason"""
    return crud.update_booking_status(
        session=session,
        booking_id=booking_id,
        new_status=BookingStatus.CANCELLED_BY_MENTOR,
        user_id=current_user.id,
    ).to_public()


@router.get("/bookings/history", response_model=List[BookingPublic])
def get_booking_history(
    session: SessionDep,
    current_user: CurrentUser,
    include_cancelled: bool = Query(True),
):
    """
    Get booking history including cancelled/completed bookings
    For showing users their past activity
    """
    query = (
        select(MentorSessionBooking)
        .where(MentorSessionBooking.mentee_id == current_user.id)
    )
    
    if not include_cancelled:
        query = query.where(
            ~MentorSessionBooking.status.in_(crud.CANCELLED_STATUSES)
        )
    
    bookings = session.exec(query).all()
    return [b.to_public() for b in bookings]


@router.delete("/bookings/{booking_id}", status_code=204)
def delete_booking(booking_id: int, session: SessionDep, current_user: CurrentUser):
    """
    Delete a booking
    - Mentees can delete their own bookings
    - Mentors can delete bookings for their sessions
    """
    crud.delete_booking(session=session, booking_id=booking_id, user_id=current_user.id)
    return None


# ================= PUBLIC MENTOR LISTING ==================
@router.get("/mentors", response_model=List[UserPublic])
def list_mentors(
    session: SessionDep,
    expertise: Optional[str] = Query(None, description="Filter by area of expertise"),
    available: Optional[bool] = Query(None, description="Only mentors currently open to mentees"),
    limit: int = Query(20, ge=1, le=100, description="Number of mentors per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
):
    """
    Public: List mentors with optional filters and pagination.
    Used in the Explore page to browse all available mentors.
    """
    mentors = crud.list_public_mentors(
        session=session,
        expertise=expertise,
        available=available,
        limit=limit,
        offset=offset,
    )
    
    return [m.to_public() for m in mentors]

@router.get("/mentors/featured", response_model=List[UserPublic])
def get_featured_mentors(session: SessionDep):
    """
    Public: Get the featured mentors (currently first 20 to sign up).
    Later this logic can be replaced with an explicit 'featured' flag.
    Displayed prominently on homepage/explore page.
    """
    mentors = crud.get_featured_mentors(session=session, limit=20)
    
    return [m.user.to_public() for m in mentors if m.user]


@router.get("/services/featured", response_model=List[MentorServicePublic])
def get_featured_services(session: SessionDep):
    """
    Public: Get featured mentor services (first 20 created, active only).
    Useful for highlighting popular service offerings on homepage.
    """
    services = crud.get_featured_services(session=session, limit=20)
    
    return [s.to_public() for s in services]


# ================= PUBLIC/ADMIN ROUTES (must be last) ==================

# TODO: Consider removing this. Already the UserPublic has all the data, a single users/{id or uuid}, does the job
# @router.get("/{identifier}/profile", response_model=MentorProfilePublic)
# def read_user_mentor_profile(identifier: str, session: SessionDep):
#     """
#     Retrieve a user's mentor profile by user_id (admin/public usage)
#     """
#     profile = crud.get_public_mentor_profile_with_relations(session, identifier)
#     return profile.to_public()


@router.get("/{user_id}/sessions", response_model=List[MentorSessionPublic])
def list_user_mentor_sessions(user_id: int, session: SessionDep):
    """Public: list all active sessions for a specific mentor"""
    sessions = crud.get_all_mentor_sessions(session, user_id, active_only=True)
    return [s.to_public() for s in sessions]


@router.get("/{user_id}/services", response_model=list[MentorServicePublic])
def list_user_mentor_services(user_id: int, session: SessionDep):
    """Public: list all active services for a specific mentor"""
    services = crud.get_all_mentor_services(session, user_id, active_only=True)
    return [s.to_public() for s in services]



@router.delete("/{user_id}/profile", status_code=204)
def delete_mentor_profile(
    user_id: int,
    session: SessionDep,
    current_user: CurrentUser,
):
    """
    Delete a mentor profile by user_id.
    - Admins can delete any mentor profile.
    - Regular users can only delete their own.
    Also removes related mentor settings and unassigns the MENTOR role.
    """
    # Check permission
    if not current_user.is_superuser and current_user.id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this mentor profile"
        )

    # Check if mentor profile exists
    mentor_profile = session.exec(
        select(MentorProfile).where(MentorProfile.user_id == user_id)
    ).first()

    if not mentor_profile:
        raise HTTPException(status_code=404, detail="Mentor profile not found")

    # Delete mentor settings
    mentor_settings = session.exec(
        select(MentorSettings).where(MentorSettings.mentor_id == user_id)
    ).first()
    if mentor_settings:
        session.delete(mentor_settings)

    # Delete mentor profile
    session.delete(mentor_profile)
    session.commit()

    # Remove mentor role if exists
    mentor_role = session.exec(
        select(Role).where(Role.name == RoleName.MENTOR.value)
    ).first()
    if mentor_role:
        user_role = session.exec(
            select(UserRole).where(
                UserRole.user_id == user_id, UserRole.role_id == mentor_role.id
            )
        ).first()
        if user_role:
            session.delete(user_role)
            session.commit()

    return {"detail": "Mentor profile deleted successfully"}


@router.get("/{user_id}/services", response_model=list[MentorServicePublic])
def list_user_mentor_services(user_id: int, session: SessionDep):
    """Public: list all active services for a specific mentor"""
    services = crud.get_all_mentor_services(session, user_id, active_only=True)
    return [s.to_public() for s in services]
