from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from schemas.chat_schema import ChatRequest, ChatResponse
from services.chat_service import process_chat_message, get_user_conversations
from routes.auth_routes import get_current_user
from models.user import User

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/", response_model=ChatResponse)
def send_chat_message(request: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return process_chat_message(db, current_user.id, request.message)

@router.get("/conversation/{user_id}", response_model=list[ChatResponse])
def get_conversations(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin" and current_user.id != user_id:
         raise HTTPException(status_code=403, detail="Not authorized to view these conversations")
    return get_user_conversations(db, user_id)
