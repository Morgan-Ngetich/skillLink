from app.core.celery import celery_app
from app.utils.validation import with_session
from uuid import UUID

# TODO uncomment this after creating celery service on railway
# @celery_app.task(name="app.tasks.sync_user_from_supabase_task")
# @with_session
def sync_user_from_supabase_task(
  user_id: str,
  email: str, 
  full_name: str | None = None, 
  avatar_url: str | None = None, 
  *, 
  session
):
  # convert string back to UUID to sync to the database. Databse expects UUID
  user_id = UUID(user_id)
  
  from app import crud
  from app.core.config import settings
  
  user = crud.sync_user_from_supabase(
    session=session,
    user_id=user_id,
    email=email,
    full_name=full_name,
    avatar_url=avatar_url or settings.DEFAULT_AVATAR_URL
  )

  return {"status" : "success", "user_id": str(user.uuid)}
