from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from schemas.ticket_schema import TicketCreate, TicketUpdate, TicketResponse
from services.ticket_service import (
    agent_can_access_ticket,
    create_ticket,
    get_assigned_tickets,
    get_ticket_by_id,
    get_tickets,
    get_user_tickets,
    update_ticket,
)
from routes.auth_routes import get_current_user
from models.user import User
from rbac.permissions import Permission, has_permission
from rbac.roles import Role
from rbac.dependencies import require_permission

router = APIRouter(prefix="/tickets", tags=["ticket"])

@router.post("/", response_model=TicketResponse)
def create_new_ticket(ticket: TicketCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_ticket(db, current_user.id, ticket)

@router.get("/", response_model=list[TicketResponse])
def list_tickets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if has_permission(current_user.role, Permission.VIEW_ALL_TICKETS):
        return get_tickets(db)
    if has_permission(current_user.role, Permission.VIEW_ASSIGNED_TICKETS):
        return get_assigned_tickets(db, current_user.id)
    raise HTTPException(status_code=403, detail="Not authorized")

@router.get("/assigned/me", response_model=list[TicketResponse])
def list_my_assigned_tickets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not has_permission(current_user.role, Permission.VIEW_ASSIGNED_TICKETS):
        raise HTTPException(status_code=403, detail="Not authorized")
    return get_assigned_tickets(db, current_user.id)

@router.get("/{user_id}", response_model=list[TicketResponse])
def list_user_tickets(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id == user_id and has_permission(current_user.role, Permission.VIEW_OWN_TICKETS):
        return get_user_tickets(db, user_id)
    if has_permission(current_user.role, Permission.VIEW_ALL_TICKETS):
        return get_user_tickets(db, user_id)
    if has_permission(current_user.role, Permission.VIEW_ASSIGNED_TICKETS):
        tickets = get_assigned_tickets(db, current_user.id)
        return [t for t in tickets if t.user_id == user_id]
    raise HTTPException(status_code=403, detail="Not authorized")

@router.patch("/{ticket_id}", response_model=TicketResponse)
def modify_ticket(ticket_id: int, ticket_data: TicketUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ticket = get_ticket_by_id(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket_data.assigned_agent_id is not None and not has_permission(current_user.role, Permission.ASSIGN_TICKETS):
        raise HTTPException(status_code=403, detail="Not authorized to assign tickets")

    if has_permission(current_user.role, Permission.VIEW_ALL_TICKETS):
        updated = update_ticket(db, ticket_id, ticket_data)
        return updated

    if has_permission(current_user.role, Permission.UPDATE_TICKET):
        if not agent_can_access_ticket(ticket, current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized to update this ticket")
        if ticket_data.assigned_agent_id is not None:
            raise HTTPException(status_code=403, detail="Agents cannot reassign tickets")
        updated = update_ticket(db, ticket_id, ticket_data)
        return updated

    raise HTTPException(status_code=403, detail="Not authorized")
