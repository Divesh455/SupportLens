from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    company: str | None = None
    role: str | None = "user"

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
