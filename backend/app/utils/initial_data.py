from sqlmodel import Session, select
from app.core.db import engine
from app.models.users import User, RoleName
from app.core.security import get_password_hash
from app import crud
from app.core.config import settings

def init_db_and_create_admin():
    with Session(engine) as session:
        # Check if the admin user already exists
        admin_user = session.exec(select(User).where(User.email == settings.FIRST_SUPERUSER)).first()
        
        if not admin_user:
            # Create the admin user
            admin_user = User(
                email=settings.FIRST_SUPERUSER,
                full_name="admin user",
                hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
                is_active=True,
            )
            session.add(admin_user)
            session.commit()
            session.refresh(admin_user)
            
            # Assign the superuser role to the admin user
            crud.assign_role(session, admin_user, RoleName.SUPERUSER)
            print(f"Admin user {admin_user.email} created with superuser role.")
        else:
            print(f"Admin user {admin_user.email} already exists.")
            
if __name__ == "__main__":
    init_db_and_create_admin()
    print("Database initialized and admin user created if not already present.")