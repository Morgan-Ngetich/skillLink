from fastapi import HTTPException
from typing import List, Dict, Optional, Union, Tuple
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from app.models.users import (
    User, 
    UserCreate,
    UserUpdate,
    Role,
    UserRole,
    RoleName,
    UserProfile,
    UserProfileCreate,
    UserProfileUpdate,
    MentorProfile,
    MentorProfileCreate,
    MentorProfileUpdate,
    Board,
    BoardList,
    BoardCreate,
    Goal,
    GoalCreate,
    GoalStatus,
    GoalType,
    GoalDifficulty,
    CardCreate,
    Card,
    CardStatus,
    CardPriority,
    Roadmap,
    RoadmapStatus,
    RoadCreate,  
)
from app.core.security import get_password_hash, verify_password
from uuid import UUID
from app.utils.logger_config import llm_logger
# from app.utils.logo_fetcher import enrich_with_logos

def get_user_by_email(session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


# Gets users by ID, First checks for the UUID, => Supabase Users
def get_user_by_id(session: Session, user_id: str | int) -> User | None:
    try:
        # Tries UUID parsing first
        user_uuid = UUID(str(user_id)) 
        return session.exec(select(User).where(User.uuid == user_uuid)).first()
    except ValueError:
        return session.get(User, int(user_id))  # Fallback to integer local ID


def create_user(session: Session, user_in: UserCreate) -> User:
    hashed_password = get_password_hash(user_in.password)
    db_user = User.model_validate(
        user_in, update={"hashed_password": hashed_password}
    )
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

def update_user(session: Session, user: User, user_in: UserUpdate) -> User:
    for key, value in user_in.dict(exclude_unset=True).items():
        setattr(user, key, value)

    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def create_user_from_supabase(session: Session, user_id: UUID, email: str, full_name: str, avatar_url: str) -> User:
    user = User(
        uuid=user_id,
        email=email,
        full_name=full_name,
        avatar_url=avatar_url,
        hashed_password="",  # Password managed by Supabase, so blank here
        is_active=True
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


def create_role(session: Session, role_name: RoleName) -> Role:
    # Ensure it's a valid enum member
    if role_name not in RoleName:
        raise HTTPException(status_code=400, detail=f"Invalid role: {role_name}")

    # Check if the role already exists
    existing_role = session.exec(
        select(Role).where(Role.name == role_name.value)
    ).first()

    # If it exists, return the existing role
    if existing_role:
        return existing_role
    # Else it doesn't exist, create the new role
    new_role = Role(name=role_name.value)
    session.add(new_role)
    session.commit()
    session.refresh(new_role)
    return new_role


def assign_role(session: Session, user: User, role_name: RoleName) -> User:
    # Create the role if it doesn't exist
    role = create_role(session, role_name)

    # Check if the user already has this role
    has_role = session.exec(
        select(UserRole).where(
            UserRole.user_id == user.id, UserRole.role_id == role.id
        )
    ).first()

    if has_role:
        return user  # User already has this role

    # Assign the role to the user
    user_role = UserRole(user_id=user.id, role_id=role.id)
    session.add(user_role)
    session.commit()
    session.refresh(user)
    return user


def sync_user_from_supabase(
    session: Session, user_id: UUID, email: str, full_name: str | None = None, avatar_url: str | None = None
) -> User:
    """
    Syncs a user from Supabase by creating or updating their record.
    """
    user = get_user_by_id(session, user_id)

    if not user:
        user = create_user_from_supabase(session, user_id, email, full_name)
    
    # Update user's full name if provided
    if full_name:
        user.full_name = full_name
    
    if avatar_url:
        user.avatar_url = avatar_url

    session.add(user)
    session.commit()
    session.refresh(user)

    return user


def update_synced_user_info(
    session: Session,
    user: User,
    email: str,
    full_name: str | None = None,
    avatar_url: str | None = None,
) -> User:
    """
    Updates user info only if changed. Logs each updated field.
    """
    updated = False

    if user.email != email:
        user.email = email
        updated = True

    if full_name is not None and user.full_name != full_name:
        user.full_name = full_name
        updated = True

    if avatar_url is not None and user.avatar_url != avatar_url:
        user.avatar_url = avatar_url
        updated = True

    if updated:
        session.add(user)
        session.commit()
        session.refresh(user)
    else:
        raise HTTPException(status_code=200, detail="No changes detected.")

    return user



# =========== USERPROFILES ============
def get_user_profile(session: Session, user_id: int) -> UserProfile | None:
    return session.get(UserProfile, user_id)

def get_user_profile_or_404(session: Session, user_id: int) -> UserProfile:
    profile = get_user_profile(session, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="UserProfile not found")
    return profile

def get_user_skills(session: Session, user_id: int) -> List[str]:
    profile = get_user_profile_or_404(session, user_id)
    return profile.skills or []

def ensure_user_profile_not_exists(session: Session, user_id: int):
    if get_user_profile(session, user_id):
        raise HTTPException(status_code=409, detail="Profile already exists for this user")

def serialize_datetime_fields(items):
    if not items:
        return items
    serialized = []
    for item in items:
        new_item = item.copy()
        for date_field in ['start_date', 'end_date']:
            if date_field in new_item and new_item[date_field] is not None:
                # Convert datetime to ISO string
                new_item[date_field] = new_item[date_field].isoformat()
        serialized.append(new_item)
    return serialized
  
def create_user_profile(session: Session, profile_in: UserProfileCreate, user_id: int) -> UserProfile:
    ensure_user_profile_not_exists(session, user_id)

    create_data = profile_in.model_dump(exclude_unset=True)

    if 'education' in create_data:
        create_data['education'] = serialize_datetime_fields(create_data['education'])
    if 'experience' in create_data:
        create_data['experience'] = serialize_datetime_fields(create_data['experience'])

    # create_data = enrich_with_logos(create_data)

    profile = UserProfile(
        user_id=user_id,
        **create_data
    )
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile

def update_user_profile(session: Session, user_id: int, profile_in: UserProfileUpdate):
    profile = get_user_profile_or_404(session, user_id)
    
    update_data = profile_in.model_dump(exclude_unset=True)

    # Serialize datetimes inside education and experience before setting
    if 'education' in update_data:
        update_data['education'] = serialize_datetime_fields(update_data['education'])
    if 'experience' in update_data:
        update_data['experience'] = serialize_datetime_fields(update_data['experience'])

    # update_data = enrich_with_logos(update_data)

    for key, value in update_data.items():
        setattr(profile, key, value)
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile
    
# MENTOR PROFILE
def get_mentor_profile(session: Session, user_id: int) -> MentorProfile | None:
    return session.get(MentorProfile, user_id)

def get_mentor_profile_or_404(session: Session, user_id: int) -> MentorProfile:
    profile = get_mentor_profile(session, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="MentorProfile not found")
    return profile


def create_mentor_profile(session: Session, profile_in: MentorProfileCreate) -> MentorProfile:
    existing_profile = get_mentor_profile(session, profile_in.user_id)
    if existing_profile:
        raise HTTPException(status_code=400, detail="MentorProfile already exists for this user")
    
    profile = MentorProfile.model_validate(profile_in)
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile

def update_mentor_profile(session: Session, user_id: int, profile_in: MentorProfileUpdate) -> MentorProfile:
    profile = get_mentor_profile_or_404(session, user_id)
    for key, value in profile_in.dict(exclude_unset=True).items():
        setattr(profile, key, value)
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile


def create_board_from_llm(
    session: Session,
    llm_data: BoardCreate,
    owner_id: int,
    roadmap_id: Optional[int] = None,
    goal_id: Optional[int] = None,
    cards_data: Optional[List[Dict]] = None
) -> Tuple[Board, int]:
    """Create board with default lists and cards from LLM output"""
        
    if not llm_data.title:
        raise HTTPException(status_code=422, detail="Board title is required")

    # 1. Create the board using pydantic model attr
    board = Board(
        title=llm_data.title,
        description=llm_data.description or "",
        owner_id=owner_id,
        roadmap_id=roadmap_id,
        goal_id=goal_id,
        is_llm_generated=True,
        # If BoardCreate has metafield, use it else just have empy dict
        llm_metadata=getattr(llm_data, 'metadata', {})
    )
    session.add(board)
    session.flush() # Get board id without commiting

    # 2. Create default lists (Backlog, To Do, etc.)
    default_definitions = [
        ("Backlog", CardStatus.BACKLOG),
        ("To Do", CardStatus.TODO),
        ("In Progress", CardStatus.IN_PROGRESS),
        ("Done", CardStatus.DONE),
        ("Blocked", CardStatus.BLOCKED)
    ]

    # Map from status to actual created list ID
    status_to_list_id = {}
    board_lists = []

    for position, (title, status) in enumerate(default_definitions):
        board_list = BoardList(
            title=title,
            status=status,
            position=position,
            board_id=board.id,
            is_llm_generated=True
        )
        session.add(board_list)
        board_lists.append(board_list)
        status_to_list_id[status] = board_list.id
     
    # Flush to get all list IDs
    session.flush()  
    
    # Create mapping after flush
    for board_list in board_lists:
        status_to_list_id[board_list.status] = board_list.id

    session.commit()

    # 3. Create cards (all cards go in Backlog by default)
    total_cards_created = 0
    if cards_data:
        backlog_list_id = status_to_list_id.get(CardStatus.BACKLOG)
        if backlog_list_id:
            created_cards = create_cards_from_llm(
                session=session,
                cards_data=cards_data,  # This is now a flat list
                created_by_id=owner_id,
                roadmap_id=roadmap_id,
                goal_id=goal_id,
                list_id=backlog_list_id
            )
            total_cards_created = len(created_cards)

    session.commit()
    session.refresh(board)
    return board, total_cards_created


def create_roadmap_from_llm(
    session: Session,
    llm_data: Union[Dict, RoadCreate],
    owner_id: int,
    # goal_id: Optional[int] = None
) -> Roadmap:
    """Create roadmap from LLM output with full validation"""
    if hasattr(llm_data, 'model_dump'):
        llm_data = llm_data.model_dump()
        
    if not llm_data.get("title"):
        raise HTTPException(status_code=422, detail="Roadmap title is required")

    # Validate dates if provided
    start_date = llm_data.get("start_date")
    target_date = llm_data.get("target_date")
    if start_date and target_date and start_date > target_date:
        raise HTTPException(
            status_code=422,
            detail="Start date cannot be after target date"
        )

    roadmap = Roadmap(
        title=llm_data["title"],
        description=llm_data.get("description", ""),
        visibility=llm_data.get("visibility", "private"),
        status=llm_data.get("status", "draft"),
        tags=llm_data.get("tags", []),
        start_date=start_date,
        target_date=target_date,
        owner_id=owner_id,
        # goal_id=goal_id, # NOTE roadmap does not need to point to the goals.
        is_llm_generated=True,
        llm_metadata=llm_data.get("metadata", {})
    )
    
    session.add(roadmap)
    session.commit()
    session.refresh(roadmap)
    return roadmap


def create_cards_from_llm(
    session: Session,
    cards_data: List[Union[Dict, CardCreate]],
    created_by_id: int,
    roadmap_id: Optional[int] = None,
    goal_id: Optional[int] = None,
    list_id: Optional[int] = None
) -> List[Card]:
    """Batch create validated cards from LLM output"""
    if not list_id:
        raise HTTPException(status_code=422, detail="list_id is required for card creation")

    processed_cards = []
    for card_data in cards_data:
        if hasattr(card_data, 'model_dump'):
            processed_cards.append(card_data.model_dump())
        else:
            processed_cards.append(card_data)
            
    created_cards = []
    for position, card_data in enumerate(processed_cards):
        try:
            # Validate status
            status = card_data.get("status", "todo")
            try:
                CardStatus(status)
            except ValueError:
                status = "todo"
                
            # Validate PRIORITY
            priority = card_data.get("priority", "medium")
            try:
                CardPriority(priority)
            except ValueError:
                priority = CardPriority.MEDIUM

            card = Card(
                title=card_data.get("title", "New Task"),
                description=card_data.get("description", ""),
                status=status,
                priority=priority,
                position=card_data.get("position", position), # Using enumarated position as fallback
                tags=card_data.get("tags", []),
                due_date=card_data.get("due_date"),
                estimated_duration=card_data.get("estimated_duration"),
                list_id=list_id,
                goal_id=goal_id,
                roadmap_id=roadmap_id,
                created_by_id=created_by_id,
                is_llm_generated=True
            )
            session.add(card)
            created_cards.append(card)
        except Exception as e:
            llm_logger.error(f"Failed to create card: {e}")
            continue
    
    if created_cards:  # Only commmit if there are cards to save.   
        session.commit()
    return created_cards



def create_goal_from_llm(
    session: Session,
    llm_data: Union[Dict, GoalCreate],
    owner_id: int,
    roadmap_id: Optional[int] = None,
    parent_goal_id: Optional[int] = None
) -> Goal:
    """Create goal from LLM output with full validation"""
    if hasattr(llm_data, 'model_dump'):
        llm_data = llm_data.model_dump()
        
    if not llm_data.get("title"):
        raise HTTPException(status_code=422, detail="Goal title is required")

    # Validate dates
    start_date = llm_data.get("start_date")
    target_date = llm_data.get("target_date")
    if start_date and target_date and start_date > target_date:
        raise HTTPException(
            status_code=422,
            detail="Start date cannot be after target date"
        )

    # Validate difficulty
    difficulty = llm_data.get("difficulty", "easy")
    try:
        GoalDifficulty(difficulty)
    except ValueError:
        difficulty = "easy"

    # Validate goal type
    goal_type = llm_data.get("type", "skill")
    try:
        GoalType(goal_type)
    except ValueError:
        goal_type = "skill"

    goal = Goal(
        title=llm_data["title"],
        description=llm_data.get("description", ""),
        type=goal_type,
        difficulty=difficulty,
        importance=llm_data.get("importance", 1),
        tags=llm_data.get("tags", []),
        start_date=start_date,
        target_date=target_date,
        owner_id=owner_id,
        roadmap_id=roadmap_id,
        parent_goal_id=parent_goal_id,
        is_llm_generated=True,
        llm_metadata=llm_data.get("metadata", {})
    )

    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal



def get_llm_generated_entities(
    session: Session,
    user_id: int,
    limit: int = 100
) -> Dict[str, List]:
    """Get all LLM-generated entities for a user"""
    roadmaps = session.exec(
        select(Roadmap)
        .where(Roadmap.owner_id == user_id)
        .where(Roadmap.is_llm_generated)
        .limit(limit)
    ).all()

    goals = session.exec(
        select(Goal)
        .where(Goal.owner_id == user_id)
        .where(Goal.is_llm_generated)
        .limit(limit)
    ).all()

    cards = session.exec(
        select(Card)
        .where(Card.created_by_id == user_id)
        .where(Card.is_llm_generated)
        .limit(limit)
    ).all()

    return {
        "roadmaps": roadmaps,
        "goals": goals,
        "cards": cards
    }