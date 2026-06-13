from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from services.history_service import get_user_history
from routes.auth_routes import get_current_user
from models.user import User

router = APIRouter(prefix="/history", tags=["history"])

@router.get("/{user_id}")
def get_history(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_user_history(db, user_id)
