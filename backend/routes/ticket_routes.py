from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from schemas.ticket_schema import TicketCreate, TicketUpdate, TicketResponse
from services.ticket_service import create_ticket, get_tickets, get_user_tickets, update_ticket
from routes.auth_routes import get_current_user
from models.user import User

router = APIRouter(prefix="/tickets", tags=["ticket"])

@router.post("/", response_model=TicketResponse)
def create_new_ticket(ticket: TicketCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_ticket(db, current_user.id, ticket)

@router.get("/", response_model=list[TicketResponse])
def list_tickets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_tickets(db)

@router.get("/{user_id}", response_model=list[TicketResponse])
def list_user_tickets(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_user_tickets(db, user_id)

@router.patch("/{ticket_id}", response_model=TicketResponse)
def modify_ticket(ticket_id: int, ticket_data: TicketUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    updated_ticket = update_ticket(db, ticket_id, ticket_data)
    if not updated_ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return updated_ticket
