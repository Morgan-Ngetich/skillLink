# scripts/create_initial_superuser.py
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlmodel import select
from app.core.db import get_session
from app.models.users import UserCreate, RoleName, Role
from app import crud

def main():
    with next(get_session()) as session:
        # Check if superuser role exists, create if missing
        role = session.exec(select(Role).where(Role.name == RoleName.SUPERUSER.value)).first()
        if not role:
            role = Role(name=RoleName.SUPERUSER.value)
            session.add(role)
            session.commit()
            session.refresh(role)

        admin_email = "admin@example.com"
        user = crud.get_user_by_email(session, admin_email)
        if not user:
            user_in = UserCreate(email=admin_email, password="supersecretpassword", full_name="Admin User")
            user = crud.create_user(session, user_in)
            crud.assign_role(session, user, RoleName.SUPERUSER)

        print(f"Superuser created: {user.email}")

if __name__ == "__main__":
    main()
