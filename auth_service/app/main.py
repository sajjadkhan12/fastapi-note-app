from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .auth import router as auth_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Notes App Auth Service", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:80", "http://localhost:3000", "http://localhost:3001"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/")
def read_root():
    return {"message": "Auth Service API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}