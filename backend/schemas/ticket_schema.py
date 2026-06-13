from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TicketCreate(BaseModel):
    issue: str
    category: Optional[str] = None
    priority: Optional[str] = "Medium"

class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    summary: Optional[str] = None

class TicketResponse(BaseModel):
    id: int
    user_id: int
    issue: str
    category: Optional[str]
    priority: str
    status: str
    summary: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
