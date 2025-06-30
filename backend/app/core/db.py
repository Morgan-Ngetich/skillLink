from sqlmodel import create_engine, Session, SQLModel, select
from app.core.config import settings
from app.models.users import User, RoleName  # Import all related models
from app.core.security import get_password_hash
from app import crud

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, echo=True)

def get_session():
    with Session(engine) as session:
        yield session

def init_db_and_create_admin():
    SQLModel.metadata.create_all(engine)
    
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
                is_superuser=True
            )
            session.add(admin_user)
            session.commit()
            session.refresh(admin_user)
            
            # Assign the superuser role to the admin user
            crud.assign_role(session, admin_user, RoleName.SUPERUSER)
        
        session.commit()  # Commit any changes made
        print("Database initialized and admin user created if not exists.")