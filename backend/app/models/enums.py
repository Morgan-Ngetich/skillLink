from enum import Enum

class ExperienceLevel(str, Enum):
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"


class MentorType(str, Enum):
    CAREER_COACH = "career_coach"
    TECHNICAL_MENTOR = "technical_mentor"
    INDUSTRY_EXPERT = "industry_expert"
    LEADERSHIP_COACH = "leadership_coach"
    ENTREPRENEUR = "entrepreneur"


class SessionType(str, Enum):
    ONE_ON_ONE = "1-on-1 Video Call"
    CODE_REVIEW = "Code Review"
    RESUME_REVIEW = "Resume Review"
    MOCK_INTERVIEW = "Mock Interview"
    CAREER_ADVICE = "Career Advice"
    PORTFOLIO_REVIEW = "Portfolio Review"


class LocationType(str, Enum):
    ONLINE = "online"
    PHYSICAL = "physical"


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED_BY_MENTEE = "cancelled_by_mentee"
    CANCELLED_BY_MENTOR = "cancelled_by_mentor"
    NO_SHOW_MENTEE = "no_show_mentee"
    NO_SHOW_MENTOR = "no_show_mentor"
    EXPIRED = "expired"


class RoleName(str, Enum):
    SUPERUSER = "superuser"
    MENTOR = "mentor"
    MENTEE = "mentee"


class RoadmapVisibility(str, Enum):
    PRIVATE = "private"
    TEAM = "team"
    PUBLIC = "public"


class RoadmapStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class GoalType(str, Enum):
    SKILL = "skill"
    PROJECT = "project"
    CAREER = "career"
    PERSONAL = "personal"


class GoalStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"


class GoalDifficulty(str, Enum):
    VERY_EASY = "very_easy"
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    VERY_HARD = "very_hard"


class CardStatus(str, Enum):
    BACKLOG = "backlog"
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    BLOCKED = "blocked"


class CardPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class TaskStatusEnum(str, Enum):
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class SafetyViolationType(str, Enum):
    DIFFICULTY = "difficulty"
    TIMING = "timing"
    PREREQUISITES = "prerequisites"
    CONFLICT = "conflict"
    SYSTEM = "system"


class LLMTargetEntity(str, Enum):
    BOARDS = "boards"
    GOALS = "goals"
    ROADMAPS = "roadmaps"
    CARDS = "cards"
    SYSTEM = "system"

    @classmethod
    def list(cls):
        return [item.value for item in cls]


class LLMActionType(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    ANALYZE = "analyze"
    CONFIRM = "confirm"