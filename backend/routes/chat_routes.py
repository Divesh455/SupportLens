from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from schemas.chat_schema import ChatRequest, ChatResponse
from services.chat_service import process_chat_message, get_user_conversations
from routes.auth_routes import get_current_user
from models.user import User
from rbac.permissions import Permission, has_permission
from models.chat_message import ChatMessage

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/", response_model=ChatResponse)
def send_chat_message(request: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not has_permission(current_user.role, Permission.AI_CHAT):
        raise HTTPException(status_code=403, detail="Not authorized")
    return process_chat_message(db, current_user.id, request.message)

@router.get("/conversation/{user_id}", response_model=list[ChatResponse])
def get_conversations(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id == user_id:
        return get_user_conversations(db, user_id)
    if has_permission(current_user.role, Permission.VIEW_ALL_TICKETS):
        return get_user_conversations(db, user_id)
    if has_permission(current_user.role, Permission.VIEW_CUSTOMER_HISTORY):
        from services.ticket_service import get_assigned_tickets
        assigned = get_assigned_tickets(db, current_user.id)
        if any(t.user_id == user_id for t in assigned):
            return get_user_conversations(db, user_id)
    raise HTTPException(status_code=403, detail="Not authorized to view these conversations")

@router.get("/messages/{user_id}")
def get_chat_messages(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != user_id and not has_permission(current_user.role, Permission.VIEW_ALL_TICKETS):
        if not has_permission(current_user.role, Permission.VIEW_CUSTOMER_HISTORY):
            raise HTTPException(status_code=403, detail="Not authorized")
        from services.ticket_service import get_assigned_tickets
        assigned = get_assigned_tickets(db, current_user.id)
        if not any(t.user_id == user_id for t in assigned):
            raise HTTPException(status_code=403, detail="Not authorized")

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.room_user_id == user_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )
    return [
        {
            "id": m.id,
            "room_user_id": m.room_user_id,
            "sender_id": m.sender_id,
            "sender_role": m.sender_role,
            "content": m.content,
            "message_type": m.message_type,
            "created_at": m.created_at,
        }
        for m in messages
    ]
