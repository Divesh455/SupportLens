from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

from rbac.roles import Role


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    company: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None


class AgentCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    company: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    company: Optional[str]
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class SystemConfig(BaseModel):
    ai_enabled: bool = True
    auto_ticket_creation: bool = True
    max_open_tickets_per_user: int = 10
