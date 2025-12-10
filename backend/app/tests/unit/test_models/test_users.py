from datetime import datetime

from app.models.enums import RoleName
from app.models import UserCreate, UserProfileCreate
from app import crud

class TestUserModels:
    """Test User and UserProfile models"""
    
    def test_create_user(self, session, user_data):
        """Test creating a user"""
        user = crud.create_user(session, UserCreate(**user_data))
        session.commit()
        
        assert user.email == user_data["email"]
        assert user.full_name == user_data["full_name"]
        assert user.hashed_password is not None
        assert user.is_active is True
        assert user.uuid is not None
        assert isinstance(user.created_at, datetime)
        assert isinstance(user.updated_at, datetime)
    

    def test_assign_role_to_user(self, session, test_user):
        """Test assigning roles to user"""
        # Assign mentor role
        crud.assign_role(session, test_user, RoleName.MENTOR)
        session.commit()
        
        # Refresh user
        session.refresh(test_user)
        
        assert test_user.has_role(RoleName.MENTOR) is True
        assert test_user.is_mentor is True
        assert test_user.is_superuser is False
        assert test_user.is_mentee is False
    
    def test_user_has_role_multiple(self, session, test_user):
        """Test user with multiple roles"""
        crud.assign_role(session, test_user, RoleName.MENTOR)
        crud.assign_role(session, test_user, RoleName.MENTEE)
        session.commit()
        
        session.refresh(test_user)
        
        assert test_user.has_role(RoleName.MENTOR) is True
        assert test_user.has_role(RoleName.MENTEE) is True
        assert test_user.is_mentor is True
        assert test_user.is_mentee is True
    
    def test_user_to_public(self, test_user, test_user_profile):
        """Test user.to_public() method"""
        public_user = test_user.to_public()
        
        assert public_user.id == test_user.id
        assert public_user.email == test_user.email
        assert public_user.full_name == test_user.full_name
        assert public_user.profile is not None
        assert public_user.profile.user_id == test_user.id
        assert public_user.roadmap_count == 0
        assert public_user.active_goal_count == 0
    
    def test_user_to_minimal(self, test_user):
        """Test user.to_minimal() method"""
        minimal_user = test_user.to_minimal()
        
        assert minimal_user.id == test_user.id
        assert minimal_user.email == test_user.email
        assert minimal_user.full_name == test_user.full_name
        assert minimal_user.avatar_url is not None
        assert minimal_user.created_at == test_user.created_at
    
    def test_create_user_profile(self, session, test_user, profile_data):
        """Test creating user profile"""
        profile = crud.create_user_profile(
            session,
            UserProfileCreate(**profile_data),
            user_id=test_user.id
        )
        session.commit()
        
        assert profile.user_id == test_user.id
        assert profile.title == profile_data["title"]
        assert profile.about == profile_data["about"]
        assert profile.location == profile_data["location"]
        assert profile.skills == profile_data["skills"]
        assert len(profile.experience) == 1
    
    def test_user_profile_completeness(self, test_user_profile):
        """Test profile completeness checks"""
        assert test_user_profile.is_profile_complete is True
        assert test_user_profile.is_profile_setup_complete is True
    
    def test_user_profile_partial_completeness(self, session, test_user):
        """Test partially complete profile"""
        profile = crud.create_user_profile(
            session,
            UserProfileCreate(
                title="Developer",
                about="Test",
                location="Test"
            ),
            user_id=test_user.id
        )
        session.commit()
        
        assert profile.is_profile_complete is False
        assert profile.is_profile_setup_complete is False  # Missing required fields
    
    def test_user_profile_to_public(self, test_user_profile):
        """Test profile.to_public() method"""
        public_profile = test_user_profile.to_public()
        
        assert public_profile.user_id == test_user_profile.user_id
        assert public_profile.title == test_user_profile.title
        assert public_profile.about == test_user_profile.about
        assert public_profile.location == test_user_profile.location
        assert public_profile.is_profile_complete == test_user_profile.is_profile_complete
        assert public_profile.mentor_profile is None  # User is not a mentor
    
    def test_update_user(self, session, test_user):
        """Test updating user information"""
        from app.models import UserUpdate
        
        update_data = UserUpdate(
            full_name="Updated Name",
            avatar_url="https://example.com/avatar.jpg",
            is_active=False
        )
        
        updated_user = crud.update_user(session, test_user, update_data)
        session.commit()
        
        assert updated_user.full_name == "Updated Name"
        assert updated_user.avatar_url == "https://example.com/avatar.jpg"
        assert updated_user.is_active is False
    
    def test_update_user_profile(self, session, test_user_profile):
        """Test updating user profile"""
        from app.models import UserProfileUpdate
        
        update_data = UserProfileUpdate(
            title="Senior Developer",
            location="New York, NY",
            skills=["Python", "FastAPI", "Docker", "Kubernetes"]
        )
        
        updated_profile = crud.update_user_profile(
            session,
            test_user_profile.user_id,
            update_data
        )
        session.commit()
        
        assert updated_profile.title == "Senior Developer"
        assert updated_profile.location == "New York, NY"
        assert updated_profile.skills == ["Python", "FastAPI", "Docker", "Kubernetes"]
    
    def test_get_user_by_email(self, session, test_user):
        """Test retrieving user by email"""
        user = crud.get_user_by_email(session, test_user.email)
        assert user is not None
        assert user.id == test_user.id
        assert user.email == test_user.email
    
    def test_get_user_by_uuid(self, session, test_user):
        """Test retrieving user by UUID"""
        user = crud.get_user_by_uuid(session, test_user.uuid)
        assert user is not None
        assert user.id == test_user.id
        assert user.uuid == test_user.uuid