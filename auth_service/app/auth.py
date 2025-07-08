from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .database import SessionLocal
from .schemas import UserCreate, UserLogin, UserUpdate
from .models import User
from .utils import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["authentication"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", summary="Register a new user")
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")

    hashed = hash_password(user.password)
    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone=user.phone,
        hashed_password=hashed,
        profile_image=user.profile_image
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"msg": "User created successfully."}

@router.post("/login", summary="Authenticate user and get access token")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials.")

    token = create_access_token(data={"sub": str(db_user.id)})
    return {"access_token": token, "token_type": "bearer"}

from .utils import get_current_user
from fastapi import Depends

@router.get("/me", summary="Get current user profile")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "profile_image": current_user.profile_image,
    }

@router.put("/me", summary="Update current user profile")
def update_current_user_profile(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Update user fields if provided
    if user_update.first_name is not None:
        current_user.first_name = user_update.first_name
    if user_update.last_name is not None:
        current_user.last_name = user_update.last_name
    if user_update.phone is not None:
        current_user.phone = user_update.phone
    if user_update.profile_image is not None:
        current_user.profile_image = user_update.profile_image
    
    db.commit()
    db.refresh(current_user)
    
    return {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "profile_image": current_user.profile_image,
    }