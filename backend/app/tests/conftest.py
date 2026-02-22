import pytest
from sqlmodel import Session, SQLModel, create_engine
from app.core.config import settings
from app.core.db import get_session
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
from typing import Generator, Dict, Any

from app.main import app
from app import crud
from app.models import (
    User,
    UserCreate,  # Import UserCreate
    UserProfile,
    MentorProfile,
    MentorSession,
    MentorService,
    MentorSettings,
    Goal,
    Roadmap,
    Board,
    Card
)
from app.models.enums import (
    ExperienceLevel,
    SessionType,
    LocationType,
    GoalType,
    GoalDifficulty,
    CardStatus,
    CardPriority,
)


@pytest.fixture(scope="module")
def engine():
    # Create engine once for the test module
    engine = create_engine(settings.TEST_DATABASE_URL)
    SQLModel.metadata.create_all(engine)
    yield engine
    
    SQLModel.metadata.drop_all(engine)
    # Dispose the engine to free resources.
    engine.dispose()


@pytest.fixture(scope="module")
def connection(engine):
    # Connect once per module
    connection = engine.connect()
    yield connection
    
    # Close the connection after tests are done.
    connection.close()


@pytest.fixture(scope="function")
def session(connection):
    # Begin a nested transaction / savepoint
    # This allows rolling back changes made during the test without affecting others.
    transaction = connection.begin_nested()
    
    # Create a new SQLModel session bound to the existing connection.
    session = Session(bind=connection)
    yield session
    
    # Close the session after the test.
    session.close()
    # Roll back the nested transaction to undo all changes made during the test.
    transaction.rollback()


@pytest.fixture
def client(session: Session) -> Generator[TestClient, None, None]:
    """Create test client with overridden database session"""
    def override_get_session():
        yield session
    
    app.dependency_overrides[get_session] = override_get_session
    yield TestClient(app)
    app.dependency_overrides.clear()


# ==================== USER FIXTURES ====================
@pytest.fixture
def user_data() -> Dict[str, Any]:
    """Base user data for tests"""
    import uuid
    unique_id = uuid.uuid4().hex[:8]
    return {
        "email": f"test-{unique_id}@example.com",  # Make unique
        "full_name": "Test User",
        "password": "password123"
    }


@pytest.fixture
def mentor_user_data() -> Dict[str, Any]:
    """Mentor user data for tests"""
    import uuid
    unique_id = uuid.uuid4().hex[:8]
    email = f"mentor-{unique_id}@example.com"
    print(f"DEBUG: Generated mentor email: {email}")  # ADD THIS
    return {
        "email": email,
        "full_name": "Mentor User",
        "password": "mentor123"
    }


@pytest.fixture
def test_user(session, user_data) -> User:
    """Create a test user"""
    user = crud.create_user(
        session,
        UserCreate(**user_data)  # Pass UserCreate object
    )
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture
def test_mentor_user(session, mentor_user_data) -> User:
    """Create a test mentor user"""
    user = crud.create_user(
        session,
        UserCreate(**mentor_user_data)  # Pass UserCreate object
    )
    session.commit()
    session.refresh(user)
    return user


# ==================== PROFILE FIXTURES ====================
@pytest.fixture
def profile_data() -> Dict[str, Any]:
    """User profile data for tests"""
    return {
        "title": "Software Developer",
        "about": "Passionate about coding",
        "location": "San Francisco, CA",
        "area_of_focus": ["Backend Development", "AI"],
        "goals": ["Become a Senior Developer", "Learn Machine Learning"],
        "interests": ["Open Source", "Tech Meetups"],
        "skills": ["Python", "FastAPI", "PostgreSQL"],
        "social_links": {"linkedin": "https://linkedin.com/in/testuser"},
        "contact_details": {"phone": "+1234567890"},
        "education": [{
            "institution": "Test University",
            "degree": "BS Computer Science"
        }],
        "experience": [{
            "company": "Test Company",
            "position": "Backend Developer",
            "description": "Built APIs"
        }]
    }


@pytest.fixture
def test_user_profile(session, test_user, profile_data) -> UserProfile:
    """Create a test user profile"""
    from app.models import UserProfileCreate
    profile = crud.create_user_profile(
        session,
        UserProfileCreate(**profile_data),
        user_id=test_user.id
    )
    session.commit()
    session.refresh(profile)
    return profile


# ==================== MENTOR FIXTURES ====================
@pytest.fixture
def mentor_profile_data(test_mentor_user) -> Dict[str, Any]:
    """Mentor profile data for tests"""
    return {
        "user_id": test_mentor_user.id,
        "title": "Senior Software Engineer",
        "industries": ["Tech", "SaaS"],
        "expertise": ["Python", "FastAPI", "System Design"],
        "experience_level": ExperienceLevel.SENIOR,
        "mentor_type": ["technical_mentor"],
        "tags": ["backend", "api-design"],
        "badges": ["verified"]
    }


@pytest.fixture
def test_mentor_profile(session, test_mentor_user, mentor_profile_data) -> MentorProfile:
    """Create a test mentor profile"""
    from app.models import MentorProfileCreate
    profile = crud.create_mentor_profile(
        session,
        MentorProfileCreate(**mentor_profile_data)
    )
    session.commit()
    session.refresh(profile)
    return profile


@pytest.fixture
def mentor_session_data(test_mentor_profile) -> Dict[str, Any]:
    """Mentor session data for tests"""
    return {
        "mentor_id": test_mentor_profile.user_id,
        "title": "Code Review Session",
        "description": "Review your code and provide feedback",
        "duration_minutes": 60,
        "price_usd": 50.0,
        "start_time": datetime.now() + timedelta(days=7),
        "end_time": datetime.now() + timedelta(days=7, hours=1),
        "timezone": "UTC",
        "is_public": True,
        "max_bookings": 5,
        "location_type": LocationType.ONLINE,
        "meeting_link": "https://zoom.us/j/123456789"
    }


@pytest.fixture
def test_mentor_session(session, test_mentor_profile, mentor_session_data) -> MentorSession:
    """Create a test mentor session"""
    from app.models import MentorSessionCreate
    session_obj = crud.create_mentor_session(
        session,
        MentorSessionCreate(**mentor_session_data)
    )
    session.commit()
    session.refresh(session_obj)
    return session_obj


@pytest.fixture
def test_mentor_service(session, test_mentor_profile) -> MentorService:
    """Create a test mentor service"""
    from app.models import MentorServiceCreate
    service = crud.create_mentor_service(
        session,
        MentorServiceCreate(
            mentor_id=test_mentor_profile.user_id,
            title="1:1 Coaching",
            description="Personalized coaching session",
            price_usd=75.0,
            estimated_duration_minutes=60,
            highlights=["Personalized feedback", "Actionable insights"]
        )
    )
    session.commit()
    session.refresh(service)
    return service


@pytest.fixture
def test_mentor_settings(session, test_mentor_profile) -> MentorSettings:
    """Create test mentor settings"""
    from app.models import MentorSettingsCreate
    settings = crud.create_mentor_settings(
        session,
        MentorSettingsCreate(
            mentor_id=test_mentor_profile.user_id,
            auto_accept_bookings=True,
            require_intro_message=False,
            max_mentees=10
        )
    )
    session.commit()
    session.refresh(settings)
    return settings


# ==================== ROADMAP FIXTURES ====================
@pytest.fixture
def roadmap_data() -> Dict[str, Any]:
    """Roadmap data for tests"""
    return {
        "title": "Python Backend Development",
        "description": "Learn Python for backend development",
        "visibility": "private",
        "status": "active",
        "tags": ["python", "backend", "fastapi"]
    }


@pytest.fixture
def test_roadmap(session, test_user, roadmap_data) -> Roadmap:
    """Create a test roadmap"""
    from app.models import RoadCreate
    roadmap = crud.create_roadmap_from_llm(
        session,
        llm_data=RoadCreate(**roadmap_data),
        owner_id=test_user.id
    )
    session.commit()
    session.refresh(roadmap)
    return roadmap


# ==================== GOAL FIXTURES ====================
@pytest.fixture
def goal_data() -> Dict[str, Any]:
    """Goal data for tests"""
    return {
        "title": "Learn FastAPI",
        "description": "Master FastAPI framework",
        "type": GoalType.SKILL,
        "difficulty": GoalDifficulty.MEDIUM,
        "importance": 4,
        "tags": ["fastapi", "python", "backend"]
    }


@pytest.fixture
def test_goal(session, test_user, test_roadmap, goal_data) -> Goal:
    """Create a test goal"""
    from app.models import GoalCreate
    goal = crud.create_goal_from_llm(
        session,
        llm_data=GoalCreate(**goal_data),
        owner_id=test_user.id,
        roadmap_id=test_roadmap.id
    )
    session.commit()
    session.refresh(goal)
    return goal


# ==================== BOARD FIXTURES ====================
@pytest.fixture
def board_data() -> Dict[str, Any]:
    """Board data for tests"""
    return {
        "title": "Development Board",
        "description": "Track development tasks"
    }


@pytest.fixture
def test_board(session, test_user, test_roadmap, board_data) -> Board:
    """Create a test board"""
    from app.models import BoardCreate
    board, _ = crud.create_board_from_llm(
        session,
        llm_data=BoardCreate(**board_data),
        owner_id=test_user.id,
        roadmap_id=test_roadmap.id
    )
    session.commit()
    session.refresh(board)
    return board


# ==================== CARD FIXTURES ====================
@pytest.fixture
def card_data() -> Dict[str, Any]:
    """Card data for tests"""
    return {
        "title": "Implement API Endpoint",
        "description": "Create REST API endpoint for users",
        "status": CardStatus.TODO,
        "priority": CardPriority.MEDIUM,
        "tags": ["backend", "api"]
    }


@pytest.fixture
def test_card(session, test_user, test_board, card_data) -> Card:
    """Create a test card"""
    from app.models import CardCreate
    # Get the first list from the board (should be Backlog)
    board_list = test_board.lists[0] if test_board.lists else None
    if not board_list:
        raise ValueError("Board has no lists")
    
    cards = crud.create_cards_from_llm(
        session,
        cards_data=[CardCreate(**card_data).model_dump()],
        created_by_id=test_user.id,
        list_id=board_list.id
    )
    
    if not cards:
        raise ValueError("Failed to create card")
    
    session.commit()
    session.refresh(cards[0])
    return cards[0]