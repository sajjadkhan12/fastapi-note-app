from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, asc
from typing import List, Optional
from . import models, schemas
from .models import Note, Category, Tag, NoteTag

# Category CRUD operations
def create_category(db: Session, category: schemas.CategoryCreate, user_id: int) -> models.Category:
    """Create a new category for a user"""
    db_category = models.Category(
        **category.dict(),
        user_id=user_id
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_categories(db: Session, user_id: int) -> List[models.Category]:
    """Get all categories for a user"""
    return db.query(models.Category).filter(models.Category.user_id == user_id).all()

def get_category(db: Session, category_id: int, user_id: int) -> Optional[models.Category]:
    """Get a specific category by ID for a user"""
    return db.query(models.Category).filter(
        and_(models.Category.id == category_id, models.Category.user_id == user_id)
    ).first()

def update_category(db: Session, category_id: int, user_id: int, category_update: schemas.CategoryUpdate) -> Optional[models.Category]:
    """Update a category"""
    db_category = get_category(db, category_id, user_id)
    if not db_category:
        return None
    
    update_data = category_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_category, field, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int, user_id: int) -> bool:
    """Delete a category and set notes' category_id to None"""
    db_category = get_category(db, category_id, user_id)
    if not db_category:
        return False
    
    # Update notes to remove category reference
    db.query(models.Note).filter(
        and_(models.Note.category_id == category_id, models.Note.user_id == user_id)
    ).update({models.Note.category_id: None})
    
    db.delete(db_category)
    db.commit()
    return True

# Tag CRUD operations
def create_tag(db: Session, tag: schemas.TagCreate, user_id: int) -> models.Tag:
    """Create a new tag for a user"""
    # Check if tag already exists
    existing_tag = db.query(models.Tag).filter(
        and_(models.Tag.name == tag.name, models.Tag.user_id == user_id)
    ).first()
    
    if existing_tag:
        return existing_tag
    
    db_tag = models.Tag(
        **tag.dict(),
        user_id=user_id
    )
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

def get_tags(db: Session, user_id: int) -> List[models.Tag]:
    """Get all tags for a user"""
    return db.query(models.Tag).filter(models.Tag.user_id == user_id).all()

def get_tag(db: Session, tag_id: int, user_id: int) -> Optional[models.Tag]:
    """Get a specific tag by ID for a user"""
    return db.query(models.Tag).filter(
        and_(models.Tag.id == tag_id, models.Tag.user_id == user_id)
    ).first()

def delete_tag(db: Session, tag_id: int, user_id: int) -> bool:
    """Delete a tag and its associations"""
    db_tag = get_tag(db, tag_id, user_id)
    if not db_tag:
        return False
    
    # Delete note-tag associations
    db.query(models.NoteTag).filter(models.NoteTag.tag_id == tag_id).delete()
    
    db.delete(db_tag)
    db.commit()
    return True

# Note CRUD operations
def create_note(db: Session, note: schemas.NoteCreate, user_id: int) -> models.Note:
    """Create a new note for a user"""
    # Create the note
    note_data = note.dict(exclude={"tag_ids"})
    
    # Convert enum values to strings
    if "status" in note_data and hasattr(note_data["status"], "value"):
        note_data["status"] = note_data["status"].value
    if "priority" in note_data and hasattr(note_data["priority"], "value"):
        note_data["priority"] = note_data["priority"].value
    
    db_note = models.Note(
        **note_data,
        user_id=user_id
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    # Add tags if provided
    if note.tag_ids:
        for tag_id in note.tag_ids:
            # Verify tag belongs to user
            tag = get_tag(db, tag_id, user_id)
            if tag:
                note_tag = models.NoteTag(note_id=db_note.id, tag_id=tag_id)
                db.add(note_tag)
        db.commit()
        db.refresh(db_note)
    
    return get_note(db, db_note.id, user_id)

def get_notes(db: Session, user_id: int, filters: schemas.NoteFilter) -> tuple[List[models.Note], int]:
    """Get notes for a user with filtering and pagination"""
    query = db.query(models.Note).filter(models.Note.user_id == user_id)
    
    # Apply filters
    if filters.search:
        search_pattern = f"%{filters.search}%"
        query = query.filter(
            or_(
                models.Note.title.ilike(search_pattern),
                models.Note.content.ilike(search_pattern)
            )
        )

    if filters.is_favorite is not None:
        query = query.filter(models.Note.is_favorite == filters.is_favorite)
    
    if filters.category_id:
        query = query.filter(models.Note.category_id == filters.category_id)
    
    if filters.tag_ids:
        # Notes that have any of the specified tags
        query = query.join(models.NoteTag).filter(models.NoteTag.tag_id.in_(filters.tag_ids))
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination and ordering
    notes = query.options(
        joinedload(models.Note.category),
        joinedload(models.Note.tags).joinedload(models.NoteTag.tag)
    ).order_by(desc(models.Note.updated_at)).offset(filters.offset).limit(filters.limit).all()
    
    return notes, total

def get_note(db: Session, note_id: int, user_id: int) -> Optional[models.Note]:
    """Get a specific note by ID for a user"""
    note = db.query(models.Note).options(
        joinedload(models.Note.category),
        joinedload(models.Note.tags).joinedload(models.NoteTag.tag)
    ).filter(
        and_(models.Note.id == note_id, models.Note.user_id == user_id)
    ).first()
    
    return note

def update_note(db: Session, note_id: int, user_id: int, note_update: schemas.NoteUpdate) -> Optional[models.Note]:
    """Update a note"""
    db_note = db.query(models.Note).filter(
        and_(models.Note.id == note_id, models.Note.user_id == user_id)
    ).first()
    
    if not db_note:
        return None
    
    # Update note fields
    update_data = note_update.dict(exclude_unset=True, exclude={"tag_ids"})
    
    # Convert enum values to strings
    for field, value in update_data.items():
        if hasattr(value, "value"):
            update_data[field] = value.value
    
    for field, value in update_data.items():
        setattr(db_note, field, value)
    
    # Update tags if provided
    if note_update.tag_ids is not None:
        # Remove existing tags
        db.query(models.NoteTag).filter(models.NoteTag.note_id == note_id).delete()
        
        # Add new tags
        for tag_id in note_update.tag_ids:
            # Verify tag belongs to user
            tag = get_tag(db, tag_id, user_id)
            if tag:
                note_tag = models.NoteTag(note_id=note_id, tag_id=tag_id)
                db.add(note_tag)
    
    db.commit()
    db.refresh(db_note)
    return get_note(db, note_id, user_id)

def delete_note(db: Session, note_id: int, user_id: int) -> bool:
    """Permanently delete a note and its associations"""
    db_note = db.query(models.Note).filter(
        and_(models.Note.id == note_id, models.Note.user_id == user_id)
    ).first()
    
    if not db_note:
        return False
    
    # Delete note-tag associations first
    db.query(models.NoteTag).filter(models.NoteTag.note_id == note_id).delete()
    
    # Delete the note permanently
    db.delete(db_note)
    db.commit()
    return True

def permanently_delete_note(db: Session, note_id: int, user_id: int) -> bool:
    """Permanently delete a note and its associations"""
    db_note = db.query(models.Note).filter(
        and_(models.Note.id == note_id, models.Note.user_id == user_id)
    ).first()
    
    if not db_note:
        return False
    
    # Delete note-tag associations
    db.query(models.NoteTag).filter(models.NoteTag.note_id == note_id).delete()
    
    db.delete(db_note)
    db.commit()
    return True

def toggle_favorite(db: Session, note_id: int, user_id: int) -> Optional[models.Note]:
    """Toggle favorite status of a note"""
    db_note = db.query(models.Note).filter(
        and_(models.Note.id == note_id, models.Note.user_id == user_id)
    ).first()
    
    if not db_note:
        return None
    
    db_note.is_favorite = not db_note.is_favorite
    db.commit()
    db.refresh(db_note)
    
    # Return the note with relationships loaded
    return db.query(models.Note).options(
        joinedload(models.Note.category),
        joinedload(models.Note.tags).joinedload(models.NoteTag.tag)
    ).filter(models.Note.id == note_id).first()

# Dashboard stats
def get_dashboard_stats(db: Session, user_id: int) -> dict:
    """Get dashboard statistics for a user"""
    # Count all notes for the user
    total_notes = db.query(models.Note).filter(models.Note.user_id == user_id).count()
    
    # Count favorite notes
    favorite_notes = db.query(models.Note).filter(
        and_(
            models.Note.user_id == user_id, 
            models.Note.is_favorite == True
        )
    ).count()
    
    categories_count = db.query(models.Category).filter(models.Category.user_id == user_id).count()
    tags_count = db.query(models.Tag).filter(models.Tag.user_id == user_id).count()
    
    # Get recent notes (last 5)
    recent_notes = db.query(models.Note).options(
        joinedload(models.Note.category),
        joinedload(models.Note.tags).joinedload(models.NoteTag.tag)
    ).filter(models.Note.user_id == user_id).order_by(desc(models.Note.updated_at)).limit(5).all()
    
    return {
        "total_notes": total_notes,
        "favorite_notes": favorite_notes,
        "categories_count": categories_count,
        "tags_count": tags_count,
        "recent_notes": recent_notes
    }


