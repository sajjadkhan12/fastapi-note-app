from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime

# Category Schemas
class CategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    color: str = Field(default="#667eea", pattern=r"^#[0-9A-Fa-f]{6}$")

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")

class Category(CategoryBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Tag Schemas
class TagBase(BaseModel):
    name: str = Field(..., max_length=50)

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Note Schemas
class NoteBase(BaseModel):
    title: str = Field(..., max_length=255)
    content: Optional[str] = None
    is_favorite: bool = False
    category_id: Optional[int] = None

class NoteCreate(NoteBase):
    tag_ids: Optional[List[int]] = []

class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    is_favorite: Optional[bool] = None
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None

class NoteResponse(NoteBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    category: Optional[Category] = None
    tags: List[Tag] = []

    class Config:
        from_attributes = True

# Search and Filter Schemas
class NoteFilter(BaseModel):
    search: Optional[str] = None
    is_favorite: Optional[bool] = None
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)

# Dashboard Stats Schema
class DashboardStats(BaseModel):
    total_notes: int
    favorite_notes: int
    categories_count: int
    tags_count: int
    recent_notes: List[NoteResponse]

# Response Schemas
class NoteList(BaseModel):
    notes: List[NoteResponse]
    total: int
    limit: int
    offset: int

class CategoryList(BaseModel):
    categories: List[Category]
    total: int

class TagList(BaseModel):
    tags: List[Tag]
    total: int

# Error Schemas
class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None
