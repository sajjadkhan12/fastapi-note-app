from pydantic import BaseModel, EmailStr, Field, constr

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    password: constr(min_length=6)
    confirm_password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str