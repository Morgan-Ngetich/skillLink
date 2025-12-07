from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional, TYPE_CHECKING
from datetime import datetime, timezone
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import ARRAY

from .enums import CardStatus, CardPriority

if TYPE_CHECKING:
    from .users import User
    from .roadmap import Roadmap, Goal
    from .public.board_public import CardPublic


# ==================== BOARD MODEL ====================
class BoardBase(SQLModel):
    title: str
    description: Optional[str] = None
    position: int = Field(default=0)
    is_archived: bool = Field(default=False)


class Board(BoardBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="users.id")
    roadmap_id: Optional[int] = Field(foreign_key="roadmap.id", default=None)
    goal_id: Optional[int] = Field(foreign_key="goal.id", default=None)
    is_llm_generated: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Relationships
    owner: "User" = Relationship(back_populates="boards")
    roadmap: Optional["Roadmap"] = Relationship(back_populates="boards")
    goal: Optional["Goal"] = Relationship()
    lists: List["BoardList"] = Relationship(back_populates="board")


class BoardCreate(BoardBase):
    pass


class BoardUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = None
    is_archived: Optional[bool] = None


# ==================== BOARD LIST MODEL ====================
class BoardListBase(SQLModel):
    title: str
    position: int = Field(default=0)
    is_archived: bool = Field(default=False)
    status: Optional["CardStatus"] = Field(default=None)


class BoardList(BoardListBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    board_id: int = Field(foreign_key="board.id")
    is_llm_generated: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Relationships
    board: "Board" = Relationship(back_populates="lists")
    cards: List["Card"] = Relationship(back_populates="list")


class BoardListCreate(BoardListBase):
    pass


class BoardListUpdate(SQLModel):
    title: Optional[str] = None
    position: Optional[int] = None
    is_archived: Optional[bool] = None


# ==================== CARD MODEL ====================
class CardBase(SQLModel):
    title: str
    description: Optional[str] = None
    status: "CardStatus" = Field(default=CardStatus.TODO)
    priority: "CardPriority" = Field(default=CardPriority.MEDIUM)
    position: int = Field(default=0)
    tags: Optional[List[str]] = Field(sa_column=Column(ARRAY(String)), default=None)
    due_date: Optional[datetime] = None
    estimated_duration: Optional[int] = None  # in minutes
    is_archived: bool = Field(default=False)


class Card(CardBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    list_id: int = Field(foreign_key="boardlist.id")
    goal_id: Optional[int] = Field(foreign_key="goal.id", default=None)
    roadmap_id: Optional[int] = Field(foreign_key="roadmap.id", default=None)
    assignee_id: Optional[int] = Field(foreign_key="users.id", default=None)
    created_by_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Relationships
    list: "BoardList" = Relationship(back_populates="cards")
    goal: Optional["Goal"] = Relationship(back_populates="cards")
    assignee: Optional["User"] = Relationship(
        back_populates="assigned_cards",
        sa_relationship_kwargs={"foreign_keys": "[Card.assignee_id]"},
    )
    created_by: "User" = Relationship(
        back_populates="created_cards",
        sa_relationship_kwargs={"foreign_keys": "[Card.created_by_id]"},
    )
    comments: List["CardComment"] = Relationship(back_populates="card")
    checklists: List["CardChecklist"] = Relationship(back_populates="card")
    
    def to_public(self) -> "CardPublic":
        """Convert to CardPublic"""
        from .public.board_public import CardPublic
        
        return CardPublic(
            id=self.id,
            title=self.title,
            description=self.description,
            status=self.status.value,
            priority=self.priority.value,
            position=self.position,
            tags=self.tags,
            due_date=self.due_date,
            estimated_duration=self.estimated_duration,
            is_archived=self.is_archived,
            created_at=self.created_at,
            updated_at=self.updated_at,
            assignee=self.assignee.to_public() if self.assignee else None,
            created_by=self.created_by.to_public() if self.created_by else None,
            goal=self.goal.to_public() if self.goal else None,
        )


class CardCreate(CardBase):
    pass


class CardUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CardStatus] = None
    priority: Optional[CardPriority] = None
    position: Optional[int] = None
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    estimated_duration: Optional[int] = None
    is_archived: Optional[bool] = None


# ==================== CARD COMMENT MODEL ====================
class CardCommentBase(SQLModel):
    content: str


class CardComment(CardCommentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    card_id: int = Field(foreign_key="card.id")
    author_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Relationships
    card: "Card" = Relationship(back_populates="comments")
    author: "User" = Relationship()


class CardCommentCreate(CardCommentBase):
    pass


class CardCommentUpdate(SQLModel):
    content: Optional[str] = None


# ==================== CARD CHECKLIST MODEL ====================
class CardChecklistBase(SQLModel):
    title: str
    position: int = Field(default=0)


class CardChecklist(CardChecklistBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    card_id: int = Field(foreign_key="card.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Relationships
    card: "Card" = Relationship(back_populates="checklists")
    items: List["CardChecklistItem"] = Relationship(back_populates="checklist")


class CardChecklistCreate(CardChecklistBase):
    pass


class CardChecklistUpdate(SQLModel):
    title: Optional[str] = None
    position: Optional[int] = None


# ==================== CARD CHECKLIST ITEM MODEL ====================
class CardChecklistItemBase(SQLModel):
    content: str
    is_completed: bool = Field(default=False)
    position: int = Field(default=0)


class CardChecklistItem(CardChecklistItemBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    checklist_id: int = Field(foreign_key="cardchecklist.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Relationships
    checklist: "CardChecklist" = Relationship(back_populates="items")


class CardChecklistItemCreate(CardChecklistItemBase):
    pass


class CardChecklistItemUpdate(SQLModel):
    content: Optional[str] = None
    is_completed: Optional[bool] = None
    position: Optional[int] = None