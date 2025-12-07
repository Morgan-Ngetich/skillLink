from sqlmodel import SQLModel, Field
from pydantic import computed_field
from typing import List, Optional, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from app.models.board import Board, BoardList
    from app.models.public.user_public import UserPublic
    from app.models.public.roadmap_public import GoalPublic


class CardPublic(SQLModel):
    """Public card without nested board/list"""
    id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    position: int = 0
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    estimated_duration: Optional[int] = None
    is_archived: bool = False
    created_at: datetime
    updated_at: datetime
    
    assignee: Optional["UserPublic"] = None
    created_by: Optional["UserPublic"] = None
    goal: Optional["GoalPublic"] = None


class ListWithCards(SQLModel):
    """BoardList with its cards"""
    boardlist: "BoardList"
    cards: List[CardPublic] = Field(default_factory=list)
    
    @computed_field
    @property
    def card_count(self) -> int:
        return len(self.cards)
    
    @classmethod
    def from_list(cls, board_list: "BoardList"):
        """Convert BoardList ORM to structure with cards"""
        return cls(
            boardlist=board_list,
            cards=sorted(
                [card.to_public() for card in board_list.cards],
                key=lambda x: x.position,
            ),
        )


class BoardWithLists(SQLModel):
    """Board with nested lists and cards"""
    board: "Board"
    lists: List[ListWithCards] = Field(default_factory=list)
    
    @computed_field
    @property
    def active_card_count(self) -> int:
        return sum(len(lst.cards) for lst in self.lists)
    
    @classmethod
    def from_board(cls, board: "Board"):
        """Convert Board ORM to structure with lists and cards"""
        return cls(
            board=board,
            lists=sorted(
                [ListWithCards.from_list(board_list) for board_list in board.lists],
                key=lambda x: x.boardlist.position,
            ),
        )
