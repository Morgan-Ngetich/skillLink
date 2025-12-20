from fastapi import APIRouter, HTTPException
from app.api.deps import SessionDep, CurrentUser
from app.models import UserSyncIn, UserPublic
from app import crud
from app.tasks.sync import sync_user_from_supabase_task

router = APIRouter()


@router.post("/sync", response_model=UserPublic)
async def sync_user(
    user_sync_in: UserSyncIn,
    current_user: CurrentUser,
    session: SessionDep
) -> UserPublic:
    """Sync user from Supabase to local database"""
    if current_user.uuid != user_sync_in.user_id:
        raise HTTPException(
            status_code=403,
            detail="You can only sync your own profile"
        )
    
    # Check for existing user
    existing_user = crud.get_user_by_email(session, user_sync_in.email)
    if existing_user:
        if str(existing_user.uuid) != str(user_sync_in.user_id):
            raise HTTPException(
                status_code=409,
                detail="User with this email already exists"
            )
        
        updated_user = crud.update_synced_user_info(
            session,
            existing_user,
            email=user_sync_in.email,
            full_name=user_sync_in.full_name,
            avatar_url=user_sync_in.avatar_url,
        )
        return updated_user.to_public()
    
    # Trigger background sync for new user
    sync_user_from_supabase_task(
        user_id=str(user_sync_in.user_id),
        email=user_sync_in.email,
        full_name=user_sync_in.full_name,
        avatar_url=user_sync_in.avatar_url,
    )
    
    return current_user.to_public()