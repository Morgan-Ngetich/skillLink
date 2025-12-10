from datetime import datetime, timedelta

from app import crud
from app.models.enums import ExperienceLevel, SessionType, LocationType
from app.models.mentor import (
    MentorProfileCreate,
    MentorSessionCreate,
    MentorServiceCreate,
    MentorSettingsCreate,
    MentorProfileUpdate,
)


class TestMentorModels:
    """Test Mentor related models"""

    def test_create_mentor_profile(
        self, session, test_mentor_user, mentor_profile_data
    ):
        """Test creating mentor profile"""
        profile = crud.create_mentor_profile(
            session, MentorProfileCreate(**mentor_profile_data)
        )
        session.commit()

        assert profile.user_id == test_mentor_user.id
        assert profile.title == mentor_profile_data["title"]
        assert profile.experience_level == ExperienceLevel.SENIOR
        assert profile.mentor_type == ["technical_mentor"]
        assert profile.total_sessions == 0
        assert profile.total_mentees == 0
        assert profile.average_rating is None

    def test_mentor_profile_completion(self, test_mentor_profile):
        """Test mentor profile completion checks"""
        assert test_mentor_profile.is_mentor_profile_complete is True
        assert test_mentor_profile.completion_percentage == 100

    def test_mentor_profile_to_public(self, test_mentor_profile):
        """Test mentor profile to_public method"""
        public_profile = test_mentor_profile.to_public()

        assert public_profile.user_id == test_mentor_profile.user_id
        assert public_profile.title == test_mentor_profile.title
        assert public_profile.expertise == test_mentor_profile.expertise
        assert public_profile.experience_level == test_mentor_profile.experience_level
        assert public_profile.total_sessions == 0
        assert public_profile.total_mentees == 0
        assert public_profile.user is not None
        assert public_profile.sessions == []
        assert public_profile.services == []

    def test_create_mentor_session(
        self, session, test_mentor_profile, mentor_session_data
    ):
        """Test creating mentor session"""
        # Add mentor_id to the session data
        session_data = mentor_session_data.copy()
        session_data["mentor_id"] = test_mentor_profile.user_id
        
        session_obj = crud.create_mentor_session(
            session,
            MentorSessionCreate(**session_data),  # Only 2 arguments
        )
        session.commit()

        assert session_obj.mentor_id == test_mentor_profile.user_id
        assert session_obj.title == mentor_session_data["title"]
        assert session_obj.session_type == SessionType.CODE_REVIEW
        assert session_obj.duration_minutes == 60
        assert session_obj.price_usd == 50.0
        assert session_obj.is_public is True
        assert session_obj.max_bookings == 5
        assert session_obj.location_type == LocationType.ONLINE
        assert session_obj.available_spots == 5

    def test_mentor_session_availability_properties(self, test_mentor_session):
        """Test mentor session availability properties"""
        assert test_mentor_session.total_bookings == 0
        assert test_mentor_session.confirmed_bookings == 0
        assert test_mentor_session.pending_bookings == 0
        assert test_mentor_session.is_full is False
        assert test_mentor_session.available_spots == 5

    def test_mentor_session_to_public(self, test_mentor_session, test_mentor_profile):
        """Test session.to_public() method with different access levels"""
        # Owner view
        owner_view = test_mentor_session.to_public(
            current_user_id=test_mentor_profile.user_id
        )
        assert owner_view.meeting_link == test_mentor_session.meeting_link
        assert len(owner_view.bookings) == 0

        # Public view (no user)
        public_view = test_mentor_session.to_public(current_user_id=None)
        assert public_view.meeting_link is None  # Hidden for non-users

        # Other user view
        other_view = test_mentor_session.to_public(current_user_id=999)
        assert other_view.meeting_link is None
        assert other_view.user_has_booked is False

    def test_create_mentor_service(self, session, test_mentor_profile):
        """Test creating mentor service"""
        service = crud.create_mentor_service(
            session,
            MentorServiceCreate(
                mentor_id=test_mentor_profile.user_id,
                title="1:1 Coaching Session",
                description="Personalized coaching session",
                price_usd=75.0,
                estimated_duration_minutes=60,
                highlights=["Personalized feedback", "Actionable insights"],
            ),
        )
        session.commit()

        assert service.mentor_id == test_mentor_profile.user_id
        assert service.title == "1:1 Coaching Session"
        assert service.price_usd == 75.0
        assert service.is_active is True
        assert service.estimated_duration_minutes == 60
        assert service.highlights == ["Personalized feedback", "Actionable insights"]

    def test_create_mentor_settings(self, session, test_mentor_profile):
        """Test creating mentor settings"""
        settings = crud.create_mentor_settings(
            session,
            MentorSettingsCreate(
                mentor_id=test_mentor_profile.user_id,
                auto_accept_bookings=False,
                require_intro_message=True,
                max_mentees=10,
            ),
        )
        session.commit()

        assert settings.mentor_id == test_mentor_profile.user_id
        assert settings.auto_accept_bookings is False
        assert settings.require_intro_message is True
        assert settings.max_mentees == 10
        assert settings.currently_open_to_mentees is True

    def test_mentor_settings_to_public(self, test_mentor_settings):
        """Test mentor settings to_public method"""
        public_settings = test_mentor_settings.to_public()

        assert public_settings.mentor_id == test_mentor_settings.mentor_id
        assert (
            public_settings.auto_accept_bookings
            == test_mentor_settings.auto_accept_bookings
        )
        assert (
            public_settings.require_intro_message
            == test_mentor_settings.require_intro_message
        )
        assert public_settings.max_mentees == test_mentor_settings.max_mentees

    def test_update_mentor_profile(self, session, test_mentor_profile):
        """Test updating mentor profile"""
        update_data = MentorProfileUpdate(  # Create the Pydantic model
            title="Lead Software Engineer Mentor",
            tags=["backend", "api-design", "system-design"],
            badges=["verified", "top-rated"],
        )

        updated_profile = crud.update_mentor_profile(
            session, test_mentor_profile.user_id, update_data
        )
        session.commit()

        assert updated_profile.title == "Lead Software Engineer Mentor"
        assert updated_profile.tags == ["backend", "api-design", "system-design"]
        assert updated_profile.badges == ["verified", "top-rated"]

    def test_update_mentor_session(self, session, test_mentor_session):
        """Test updating mentor session"""
        from datetime import timezone
        
        new_time = datetime.now(timezone.utc) + timedelta(days=2)

        from app.models import MentorSessionUpdate 
            
        update_data = MentorSessionUpdate(  # Use Pydantic model
            title="Updated Session Title",
            price_usd=75.0,
            max_bookings=10,
            start_time=new_time,
        )

        updated_session = crud.update_mentor_session(
            session, test_mentor_session.id, update_data
        )
        session.commit()

        assert updated_session.title == "Updated Session Title"
        assert updated_session.price_usd == 75.0
        assert updated_session.max_bookings == 10
        
        # Compare with tolerance (datetimes might differ by microseconds)
        time_diff = abs((updated_session.start_time - new_time).total_seconds())
        assert time_diff < 1.0  # Less than 1 second difference
        
        #NOTE Alternatively, you can use: This test is less precise but simpler
        # assert updated_session.start_time == new_time

    def test_mentor_service_to_public(self, test_mentor_service):
        """Test mentor service to_public method"""
        public_service = test_mentor_service.to_public()

        assert public_service.mentor_id == test_mentor_service.mentor_id
        assert public_service.title == test_mentor_service.title
        assert public_service.price_usd == test_mentor_service.price_usd
        assert public_service.is_active == test_mentor_service.is_active
