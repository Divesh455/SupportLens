from sqlalchemy.orm import Session
from models.ticket import Ticket
from schemas.ticket_schema import TicketCreate, TicketUpdate

def create_ticket(db: Session, user_id: int, ticket_data: TicketCreate):
    new_ticket = Ticket(
        user_id=user_id,
        issue=ticket_data.issue,
        category=ticket_data.category,
        priority=ticket_data.priority,
        status="Open",
        summary=f"Ticket created for: {ticket_data.issue[:50]}"
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket

def get_tickets(db: Session):
    return db.query(Ticket).order_by(Ticket.created_at.desc()).all()

def get_user_tickets(db: Session, user_id: int):
    return db.query(Ticket).filter(Ticket.user_id == user_id).order_by(Ticket.created_at.desc()).all()

def get_assigned_tickets(db: Session, agent_id: int):
    return (
        db.query(Ticket)
        .filter(Ticket.assigned_agent_id == agent_id)
        .order_by(Ticket.created_at.desc())
        .all()
    )

def get_ticket_by_id(db: Session, ticket_id: int):
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()

def agent_can_access_ticket(ticket: Ticket, agent_id: int) -> bool:
    return ticket.assigned_agent_id == agent_id

def update_ticket(db: Session, ticket_id: int, ticket_data: TicketUpdate):
    ticket = get_ticket_by_id(db, ticket_id)
    if not ticket:
        return None

    if ticket_data.status is not None:
        ticket.status = ticket_data.status
    if ticket_data.priority is not None:
        ticket.priority = ticket_data.priority
    if ticket_data.summary is not None:
        ticket.summary = ticket_data.summary
    if ticket_data.assigned_agent_id is not None:
        ticket.assigned_agent_id = ticket_data.assigned_agent_id

    db.commit()
    db.refresh(ticket)
    return ticket
