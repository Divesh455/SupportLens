from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    id: int
    user_id: int
    ticket_id: Optional[int]
    question: str
    answer: str
    sentiment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class MemoryResponse(BaseModel):
    id: int
    user_id: int
    memory_text: str
    memory_type: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
