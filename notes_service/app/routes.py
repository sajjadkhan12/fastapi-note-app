from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from . import crud, schemas, models
from .database import SessionLocal
from .auth import get_current_user_id

router = APIRouter()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Helper function to transform notes for response
def _transform_note_for_response(note):
    """Transform a note with NoteTag relationships to proper tags for API response"""
    if not note:
        return None
    
    # Extract actual tags from NoteTag relationships
    tags = []
    if hasattr(note, 'tags') and note.tags:
        tags = [note_tag.tag for note_tag in note.tags if hasattr(note_tag, 'tag')]
    
    # Create a response dict
    note_dict = {
        "id": note.id,
        "title": note.title,
        "content": note.content,
        "is_favorite": note.is_favorite,
        "category_id": note.category_id,
        "user_id": note.user_id,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
        "category": note.category,
        "tags": tags
    }
    
    return schemas.NoteResponse(**note_dict)

# Category routes
@router.post("/categories", response_model=schemas.Category, status_code=status.HTTP_201_CREATED)
def create_category(
    category: schemas.CategoryCreate,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new category"""
    return crud.create_category(db=db, category=category, user_id=current_user_id)

@router.get("/categories", response_model=schemas.CategoryList)
def get_categories(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get all categories for the current user"""
    categories = crud.get_categories(db=db, user_id=current_user_id)
    return schemas.CategoryList(categories=categories, total=len(categories))

@router.get("/categories/{category_id}", response_model=schemas.Category)
def get_category(
    category_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get a specific category"""
    category = crud.get_category(db=db, category_id=category_id, user_id=current_user_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.put("/categories/{category_id}", response_model=schemas.Category)
def update_category(
    category_id: int,
    category_update: schemas.CategoryUpdate,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update a category"""
    category = crud.update_category(
        db=db, category_id=category_id, user_id=current_user_id, category_update=category_update
    )
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Delete a category"""
    if not crud.delete_category(db=db, category_id=category_id, user_id=current_user_id):
        raise HTTPException(status_code=404, detail="Category not found")

# Tag routes
@router.post("/tags", response_model=schemas.Tag, status_code=status.HTTP_201_CREATED)
def create_tag(
    tag: schemas.TagCreate,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new tag"""
    return crud.create_tag(db=db, tag=tag, user_id=current_user_id)

@router.get("/tags", response_model=schemas.TagList)
def get_tags(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get all tags for the current user"""
    tags = crud.get_tags(db=db, user_id=current_user_id)
    return schemas.TagList(tags=tags, total=len(tags))

@router.delete("/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Delete a tag"""
    if not crud.delete_tag(db=db, tag_id=tag_id, user_id=current_user_id):
        raise HTTPException(status_code=404, detail="Tag not found")

# Note routes
@router.post("/notes", response_model=schemas.NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    note: schemas.NoteCreate,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Create a new note"""
    # Validate category if provided
    if note.category_id:
        category = crud.get_category(db=db, category_id=note.category_id, user_id=current_user_id)
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")
    
    note_result = crud.create_note(db=db, note=note, user_id=current_user_id)
    return _transform_note_for_response(note_result)

@router.get("/notes", response_model=schemas.NoteList)
def get_notes(
    search: Optional[str] = Query(None, description="Search in title and content"),
    is_favorite: Optional[bool] = Query(None, description="Filter by favorite status"),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    tag_ids: Optional[List[int]] = Query(None, description="Filter by tags"),
    limit: int = Query(20, ge=1, le=100, description="Number of notes to return"),
    offset: int = Query(0, ge=0, description="Number of notes to skip"),
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get notes with filtering and pagination"""
    filters = schemas.NoteFilter(
        search=search,
        is_favorite=is_favorite,
        category_id=category_id,
        tag_ids=tag_ids,
        limit=limit,
        offset=offset
    )
    
    notes, total = crud.get_notes(db=db, user_id=current_user_id, filters=filters)
    # Transform notes for proper serialization
    transformed_notes = [_transform_note_for_response(note) for note in notes]
    return schemas.NoteList(notes=transformed_notes, total=total, limit=limit, offset=offset)

@router.get("/notes/{note_id}", response_model=schemas.NoteResponse)
def get_note(
    note_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get a specific note"""
    note = crud.get_note(db=db, note_id=note_id, user_id=current_user_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return _transform_note_for_response(note)

@router.put("/notes/{note_id}", response_model=schemas.NoteResponse)
def update_note(
    note_id: int,
    note_update: schemas.NoteUpdate,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Update a note"""
    # Validate category if provided
    if note_update.category_id:
        category = crud.get_category(db=db, category_id=note_update.category_id, user_id=current_user_id)
        if not category:
            raise HTTPException(status_code=400, detail="Category not found")
    
    note = crud.update_note(
        db=db, note_id=note_id, user_id=current_user_id, note_update=note_update
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return _transform_note_for_response(note)

@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    permanent: bool = Query(False, description="Permanently delete the note"),
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Delete a note (soft delete by default, permanent if specified)"""
    if permanent:
        success = crud.permanently_delete_note(db=db, note_id=note_id, user_id=current_user_id)
    else:
        success = crud.delete_note(db=db, note_id=note_id, user_id=current_user_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Note not found")

# Note actions
@router.post("/notes/{note_id}/favorite", response_model=schemas.NoteResponse)
def toggle_favorite(
    note_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Toggle favorite status of a note"""
    note = crud.toggle_favorite(db=db, note_id=note_id, user_id=current_user_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return _transform_note_for_response(note)

# Dashboard
@router.get("/dashboard", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics and recent notes"""
    stats = crud.get_dashboard_stats(db=db, user_id=current_user_id)
    # Transform recent notes for proper serialization
    transformed_recent_notes = [_transform_note_for_response(note) for note in stats["recent_notes"]]
    stats["recent_notes"] = transformed_recent_notes
    return schemas.DashboardStats(**stats)
