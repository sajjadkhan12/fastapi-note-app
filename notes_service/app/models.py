from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(7), default="#667eea")  # Hex color code
    user_id = Column(Integer, nullable=False, index=True)  # Foreign key to user service
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship to notes
    notes = relationship("Note", back_populates="category")

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    is_favorite = Column(Boolean, default=False)
    user_id = Column(Integer, nullable=False, index=True)  # Foreign key to user service
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship to category
    category = relationship("Category", back_populates="notes")
    # Relationship to tags
    tags = relationship("NoteTag", back_populates="note")

class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)
    user_id = Column(Integer, nullable=False, index=True)  # Foreign key to user service
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to note tags
    note_tags = relationship("NoteTag", back_populates="tag")

class NoteTag(Base):
    __tablename__ = "note_tags"

    id = Column(Integer, primary_key=True, index=True)
    note_id = Column(Integer, ForeignKey("notes.id"), nullable=False)
    tag_id = Column(Integer, ForeignKey("tags.id"), nullable=False)

    # Relationships
    note = relationship("Note", back_populates="tags")
    tag = relationship("Tag", back_populates="note_tags")
