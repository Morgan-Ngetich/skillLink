from datetime import datetime
from uuid import uuid4

from app.models.public.user_public import (
    UserMinimal, 
    UserProfilePublic,
    UserPublic,
    UsersPublic,
    BookingPublic
)
from app.models.base import Education
from app.models.enums import BookingStatus


class TestUserPublicModels:
    """Test User public models"""
    
    def test_user_minimal_creation(self):
        """Test creating UserMinimal"""
        user_id = 1
        user_uuid = str(uuid4())
        created_at = datetime.now()
        
        user = UserMinimal(
            id=user_id,
            uuid=user_uuid,
            full_name="Test User",
            email="test@example.com",
            avatar_url="https://example.com/avatar.jpg",
            cover_image="https://example.com/cover.jpg",
            is_superuser=False,
            is_mentor=False,
            is_mentee=True,
            created_at=created_at,
            updated_at=created_at
        )
        
        assert user.id == user_id
        assert user.uuid == user_uuid
        assert user.full_name == "Test User"
        assert user.email == "test@example.com"
        assert user.avatar_url == "https://example.com/avatar.jpg"
        assert user.cover_image == "https://example.com/cover.jpg"
        assert user.is_superuser is False
        assert user.is_mentor is False
        assert user.is_mentee is True
        assert user.created_at == created_at
    
    def test_user_profile_public_creation(self):
        """Test creating UserProfilePublic"""
        profile = UserProfilePublic(
            user_id=1,
            uuid=str(uuid4()),
            title="Software Developer",
            about="Passionate about coding",
            location="San Francisco, CA",
            skills=["Python", "FastAPI"],
            education=[
                Education(
                    institution="Test University",
                    degree="BS Computer Science"
                )
            ],
            is_profile_complete=True,
            is_profile_setup_complete=True,
            mentor_profile=None
        )
        
        assert profile.user_id == 1
        assert profile.title == "Software Developer"
        assert profile.about == "Passionate about coding"
        assert profile.location == "San Francisco, CA"
        assert profile.skills == ["Python", "FastAPI"]
        assert len(profile.education) == 1
        assert profile.is_profile_complete is True
        assert profile.is_profile_setup_complete is True
        assert profile.mentor_profile is None
    
    def test_user_public_creation(self):
        """Test creating UserPublic"""
        user = UserPublic(
            id=1,
            uuid=str(uuid4()),
            full_name="Test User",
            email="test@example.com",
            avatar_url="https://example.com/avatar.jpg",
            cover_image="https://example.com/cover.jpg",
            is_superuser=False,
            is_mentor=False,
            is_mentee=True,
            profile=None,
            roadmap_count=3,
            active_goal_count=2,
            boards=[],
            roadmaps=[],
            goals=[],
            assigned_cards=[],
            created_cards=[]
        )
        
        assert user.id == 1
        assert user.full_name == "Test User"
        assert user.email == "test@example.com"
        assert user.roadmap_count == 3
        assert user.active_goal_count == 2
        assert user.profile is None
    
    def test_users_public_creation(self):
        """Test creating UsersPublic (list of users)"""
        users = [
            UserPublic(
                id=1,
                uuid=str(uuid4()),
                full_name="User 1",
                email="user1@example.com",
                is_superuser=False,
                is_mentor=False,
                is_mentee=True,
                profile=None,
                roadmap_count=0,
                active_goal_count=0,
                boards=[],
                roadmaps=[],
                goals=[],
                assigned_cards=[],
                created_cards=[]
            ),
            UserPublic(
                id=2,
                uuid=str(uuid4()),
                full_name="User 2",
                email="user2@example.com",
                is_superuser=False,
                is_mentor=True,
                is_mentee=False,
                profile=None,
                roadmap_count=0,
                active_goal_count=0,
                boards=[],
                roadmaps=[],
                goals=[],
                assigned_cards=[],
                created_cards=[]
            )
        ]
        
        users_public = UsersPublic(
            data=users,
            count=2
        )
        
        assert len(users_public.data) == 2
        assert users_public.count == 2
        assert users_public.data[0].id == 1
        assert users_public.data[1].id == 2
    
    def test_booking_public_creation(self):
        """Test creating BookingPublic"""
        from app.models.public.user_public import UserMinimal
        
        mentee = UserMinimal(
            id=2,
            uuid=str(uuid4()),
            full_name="Mentee User",
            email="mentee@example.com",
            is_superuser=False,
            is_mentor=False,
            is_mentee=True
        )
        
        booking = BookingPublic(
            id=1,
            uuid=uuid4(),
            session_id=10,
            mentee=mentee,
            status=BookingStatus.CONFIRMED,
            message="Looking forward to the session",
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        assert booking.id == 1
        assert booking.session_id == 10
        assert booking.mentee.id == 2
        assert booking.status == BookingStatus.CONFIRMED
        assert booking.message == "Looking forward to the session"