"""Base classes, mixins, and shared utilities"""
from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class CleanStrFieldsMixin(BaseModel):
    """Converts empty strings to None for all fields in inheriting models."""
    @field_validator("*", mode="before")
    @classmethod
    def empty_string_to_none(cls, v):
        if isinstance(v, str) and v.strip() == "":
            return None
        return v

class Education(CleanStrFieldsMixin):
    institution: Optional[str] = None
    logo: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class Experience(CleanStrFieldsMixin):
    company: Optional[str] = None
    logo: Optional[str] = None
    position: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class PreparationMaterial(BaseModel):
    title: str
    description: Optional[str] = None
    url: str
    type: Optional[str] = None  # e.g. "pdf", "video", "article"
