from datetime import datetime, timezone
from typing import Dict, List
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from sqlalchemy import case, func
from functools import lru_cache

class ProgressService:
    """Unified service for all progress calculations"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def for_roadmap(self, roadmap_id: int) -> Dict[str, object]:
        """Enhanced roadmap progress with multiple metrics"""
        from app.models.users import Roadmap
        roadmap = self.session.get(Roadmap, roadmap_id)
        if not roadmap:
            raise ValueError("Roadmap not found")
            
        # Time-based progress
        time_progress = self._calculate_timeline_progress(
            roadmap.start_date, 
            roadmap.target_date
        )
        
        # Goal-based progress
        goal_stats = self._calculate_roadmap_goal_stats(roadmap_id)
        
        return {
            "time_progress": time_progress,
            "goal_progress": goal_stats["completion_percentage"],
            "combined_progress": (time_progress * 0.3) + (goal_stats["completion_percentage"] * 0.7),
            "details": goal_stats
        }
    
    def for_user(self, user_id: int) -> Dict[str, object]:
        """User progress with additional metrics"""
        # ... similar enhanced implementation ...
    
    def for_goal(self, goal_id: int) -> Dict[str, object]:
        """Detailed goal progress"""
        from app.models.users import Roadmap, Goal, GoalStatus, CardStatus
        goal = self.session.get(Goal, goal_id, options=[
            selectinload(Goal.sub_goals),
            selectinload(Goal.cards)
        ])
        
        return {
            "progress": self.calculate_goal_progress(goal),
            "subgoals": [
                {"id": sg.id, "title": sg.title, "progress": self.calculate_goal_progress(sg)}
                for sg in goal.sub_goals
            ],
            "cards": [
                {"id": c.id, "title": c.title, "status": c.status}
                for c in goal.cards
            ]
        }
    
    @staticmethod
    def calculate_goal_progress(goal) -> float:
        """Weighted progress calculation"""
        from app.models.users import Roadmap, Goal, GoalStatus, CardStatus
        # Subgoals contribute 40%
        subgoal_progress = (
            sum(1 for sg in goal.sub_goals if sg.status == GoalStatus.COMPLETED) / 
            len(goal.sub_goals) if goal.sub_goals else 0
        )
        
        # Cards contribute 50%
        card_progress = (
            sum(1 for c in goal.cards if c.status == CardStatus.DONE) /
            len(goal.cards)) if goal.cards else 0
        
        
        # Status contributes 10%
        status_progress = {
            GoalStatus.NOT_STARTED: 0.0,
            GoalStatus.IN_PROGRESS: 0.3,
            GoalStatus.BLOCKED: 0.1,
            GoalStatus.COMPLETED: 1.0,
        }.get(goal.status, 0.0)
        
        return (subgoal_progress * 0.4) + (card_progress * 0.5) + (status_progress * 0.1)
    
    @staticmethod
    def _calculate_timeline_progress(start: datetime, end: datetime) -> float:
        """Time-based progress (0-1)"""
        if not start or not end:
            return 0.0
            
        now = datetime.now(timezone.utc)
        if now < start:
            return 0.0
        if now > end:
            return 1.0
            
        total = (end - start).total_seconds()
        elapsed = (now - start).total_seconds()
        return min(1.0, max(0.0, elapsed / total))
    
    def _calculate_roadmap_goal_stats(self, roadmap_id: int) -> Dict[str, object]:
        """Optimized goal statistics for roadmap"""
        from app.models.users import Goal, GoalStatus
        # Batch load all goals with their subgoals
        goals = self.session.exec(
            select(Goal)
            .where(Goal.roadmap_id == roadmap_id)
            .options(
                selectinload(Goal.sub_goals),
                selectinload(Goal.cards)
            )
        ).all()
        
        # Calculate progress for each goal
        goal_progress = []
        for goal in goals:
            progress = self.calculate_goal_progress(goal)
            goal_progress.append({
                "goal_id": goal.id,
                "title": goal.title,
                "progress": progress,
                "status": goal.status,
                "type": goal.type,
                "has_subgoals": len(goal.sub_goals) > 0,
                "card_count": len(goal.cards)
            })
        
        # Aggregate statistics
        total_goals = len(goals)
        avg_progress = sum(g["progress"] for g in goal_progress) / total_goals if total_goals > 0 else 0
        
        return {
            "total_goals": total_goals,
            "completed_goals": sum(1 for g in goals if g.status == GoalStatus.COMPLETED),
            "completion_percentage": avg_progress,
            "goals": goal_progress
        }