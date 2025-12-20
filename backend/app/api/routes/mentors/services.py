from fastapi import APIRouter, HTTPException
from typing import List
from app.api.deps import SessionDep, CurrentUser
from app.models import (
    MentorServicePublic,
    MentorServiceCreate,
    MentorServiceUpdate,
)
from app import crud

router = APIRouter()


@router.post("/services", response_model=MentorServicePublic, status_code=201)
def create_service(
    service_in: MentorServiceCreate,
    session: SessionDep,
    current_user: CurrentUser
):
    """Create new service offering"""
    if service_in.mentor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Cannot create service for another mentor"
        )
    
    crud.get_mentor_profile_or_404(session, current_user.id)
    service = crud.create_mentor_service(session, service_in)
    return service.to_public()


@router.get("/services", response_model=List[MentorServicePublic])
def list_my_services(session: SessionDep, current_user: CurrentUser):
    """List current mentor's services"""
    services = crud.list_services_by_mentor(session, current_user.id)
    return [s.to_public() for s in services]


@router.patch("/services/{service_id}", response_model=MentorServicePublic)
def update_service(
    service_id: int,
    service_in: MentorServiceUpdate,
    session: SessionDep,
    current_user: CurrentUser
):
    """Update service"""
    service = crud.get_mentor_service_or_404(session, service_id)
    if service.mentor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update this service"
        )
    
    updated = crud.update_mentor_service(session, service_id, service_in)
    return updated.to_public()


@router.delete("/services/{service_id}", status_code=204)
def delete_service(
    service_id: int,
    session: SessionDep,
    current_user: CurrentUser
):
    """Delete service"""
    service = crud.get_mentor_service_or_404(session, service_id)
    if service.mentor_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to delete this service"
        )
    
    crud.delete_mentor_service(session, service_id)
    return None


@router.get("/{mentor_id}/services", response_model=List[MentorServicePublic])
def get_mentor_services(mentor_id: int, session: SessionDep):
    """Get mentor's services (public)"""
    services = crud.list_services_by_mentor(
        session,
        mentor_id,
        active_only=True
    )
    return [s.to_public() for s in services]