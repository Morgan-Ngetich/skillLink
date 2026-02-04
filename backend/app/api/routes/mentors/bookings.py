from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from sqlmodel import select
from app.api.deps import SessionDep, CurrentUser, CurrentUserOptional
from app.models import (
    BookingPublic,
    BookingCreateRequest,
    BookingStatusUpdate,
    BookingStatus,
    MentorSessionBooking,
)
from app import crud

router = APIRouter()


@router.post(
    "/sessions/{session_id}/book",
    response_model=BookingPublic,
    status_code=201
)
def book_session(
    session_id: int,
    booking_data: BookingCreateRequest,
    session: SessionDep,
    current_user: CurrentUser
):
    """Book a mentor session"""
    booking = crud.create_session_booking(
        session=session,
        session_id=session_id,
        mentee_id=current_user.id,
        message=booking_data.message,
    )
    return booking.to_public(current_user_id=current_user.id)


@router.get("/bookings", response_model=List[BookingPublic])
def list_my_bookings(
    session: SessionDep,
    current_user: CurrentUserOptional = None,
    status: Optional[BookingStatus] = Query(None)
):
    """List current user's bookings"""
    bookings = crud.get_user_bookings(
        session=session,
        user_id=current_user.id,
        status=status
    )
    return [b.to_public(current_user_id=current_user.id if current_user else None) for b in bookings]


@router.get("/bookings/history", response_model=List[BookingPublic])
def get_booking_history(
    session: SessionDep,
    current_user: CurrentUser,
    include_cancelled: bool = Query(True)
):
    """Get booking history including cancelled/completed"""
    query = select(MentorSessionBooking).where(
        MentorSessionBooking.mentee_id == current_user.id
    )
    
    if not include_cancelled:
        query = query.where(
            ~MentorSessionBooking.status.in_(crud.CANCELLED_STATUSES)
        )
    
    bookings = session.exec(query).all()
    return [b.to_public(current_user_id=current_user.id) for b in bookings]


@router.patch("/bookings/{booking_id}/status", response_model=BookingPublic)
def update_booking_status(
    booking_id: int,
    status_update: BookingStatusUpdate,
    session: SessionDep,
    current_user: CurrentUser
):
    """Update booking status"""
    booking = crud.update_booking_status(
        session=session,
        booking_id=booking_id,
        new_status=status_update.status,
        user_id=current_user.id
    )
    return booking.to_public(current_user_id=current_user.id)


@router.post("/bookings/{booking_id}/confirm", response_model=BookingPublic)
def confirm_booking(
    booking_id: int,
    session: SessionDep,
    current_user: CurrentUser
):
    """Confirm pending booking (mentor only)"""
    return crud.update_booking_status(
        session=session,
        booking_id=booking_id,
        new_status=BookingStatus.CONFIRMED,
        user_id=current_user.id
    ).to_public(current_user_id=current_user.id)


@router.post("/bookings/{booking_id}/deny", response_model=BookingPublic)
def deny_booking(
    booking_id: int,
    reason: str,
    session: SessionDep,
    current_user: CurrentUser
):
    """Deny pending booking with reason (mentor only)"""
    return crud.update_booking_status(
        session=session,
        booking_id=booking_id,
        new_status=BookingStatus.CANCELLED_BY_MENTOR,
        user_id=current_user.id
    ).to_public(current_user_id=current_user.id)


@router.delete("/bookings/{booking_id}", status_code=204)
def delete_booking(
    booking_id: int,
    session: SessionDep,
    current_user: CurrentUser
):
    """Delete booking"""
    crud.delete_booking(
        session=session,
        booking_id=booking_id,
        user_id=current_user.id
    )
    return None
