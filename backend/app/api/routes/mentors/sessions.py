from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID
from app.api.deps import SessionDep, CurrentUser, CurrentUserOptional
from app.models import (
    MentorSessionPublic,
    MentorSessionCreate,
    MentorSessionUpdate,
    MentorSession,
)
from app import crud

router = APIRouter()


@router.post("/sessions", response_model=MentorSessionPublic, status_code=201)
def create_session(
    session_in: MentorSessionCreate,
    session: SessionDep,
    current_user: CurrentUser
):
    """Create new mentor session"""
    if session_in.mentor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Cannot create session for another mentor"
        )
    
    crud.get_mentor_profile_or_404(session, current_user.id)
    mentor_session = crud.create_mentor_session(session, session_in)
    return mentor_session.to_public()


@router.get("/sessions", response_model=List[MentorSessionPublic])
def list_sessions(
    session: SessionDep,
    current_user: CurrentUserOptional,
    skip: int = 0,
    limit: int = 100
):
    """List sessions visible to current user"""
    current_user_id = current_user.id if current_user else None
    sessions = crud.get_public_sessions(
        session,
        current_user_id=current_user_id,
        skip=skip,
        limit=limit
    )
    public_sessions = [s.to_public(current_user_id=current_user_id) for s in sessions]
    return public_sessions


@router.get("/sessions/{session_uuid}", response_model=MentorSessionPublic)
def get_session(
    session_uuid: UUID,
    session: SessionDep,
    current_user: CurrentUserOptional  # Back to optional
):
    """Get session by UUID with privacy checks"""
    mentor_session: MentorSession = crud.get_mentor_session_or_404_by_uuid(
        session,
        session_uuid
    )
    
    current_user_id = current_user.id if current_user else None
    
    # 🔍 Log auth state
    if current_user:
        print(f"✅ Authenticated user {current_user_id} viewing session {session_uuid}")
    else:
        print(f"👤 Unauthenticated user viewing session {session_uuid}")
    
    # Privacy check for private sessions
    if not mentor_session.is_public:
        if not current_user_id:
            raise HTTPException(
                status_code=401,  # Changed from 403
                detail="Authentication required to view private session"
            )
        if not mentor_session.can_user_access(current_user_id):
            raise HTTPException(
                status_code=403,
                detail="No access to this private session"
            )
    public_mentor_session = mentor_session.to_public(current_user_id=current_user_id)
    return public_mentor_session


@router.patch("/sessions/{session_id}", response_model=MentorSessionPublic)
def update_session(
    session_id: int,
    session_in: MentorSessionUpdate,
    session: SessionDep,
    current_user: CurrentUser
):
    """Update mentor session"""
    mentor_session = crud.get_mentor_session_or_404(session, session_id)
    if mentor_session.mentor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this session"
        )
    
    updated = crud.update_mentor_session(session, session_id, session_in)
    return updated.to_public(current_user_id=current_user.id)


@router.patch(
    "/sessions/{session_id}/toggle-public",
    response_model=MentorSessionPublic
)
def toggle_session_visibility(
    session_id: int,
    session: SessionDep,
    current_user: CurrentUser
):
    """Toggle session public/private visibility"""
    mentor_session = crud.get_mentor_session_or_404(session, session_id)
    
    if mentor_session.mentor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this session"
        )
    
    mentor_session.is_public = not mentor_session.is_public
    
    session.add(mentor_session)
    session.commit()
    session.refresh(mentor_session)
    
    return mentor_session.to_public(current_user_id=current_user.id)


@router.delete("/sessions/{session_id}", status_code=204)
def cancel_session(
    session_id: int,
    session: SessionDep,
    current_user: CurrentUser
):
    """Cancel session (soft delete)"""
    mentor_session = crud.get_mentor_session_or_404(session, session_id)
    if mentor_session.mentor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to delete this session"
        )
    
    crud.cancel_mentor_sessions(session, session_id)
    return None


@router.get("/{mentor_id}/sessions", response_model=List[MentorSessionPublic])
def get_mentor_sessions(
    mentor_id: int,
    session: SessionDep,
    current_user: CurrentUser
):
    """Get all sessions for a specific mentor"""
    current_user_id = current_user.id if current_user else None
    sessions = crud.get_mentor_sessions(
        session,
        mentor_id=mentor_id,
        current_user_id=current_user_id
    )
    return [s.to_public(current_user_id=current_user_id) for s in sessions]
