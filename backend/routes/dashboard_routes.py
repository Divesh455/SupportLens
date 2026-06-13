from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.db import get_db
from models.user import User
from models.ticket import Ticket
from models.interaction import Interaction
from routes.auth_routes import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    total_customers = db.query(User).filter(User.role == "user").count()
    total_tickets = db.query(Ticket).count()
    open_tickets = db.query(Ticket).filter(Ticket.status == "Open").count()
    resolved_tickets = db.query(Ticket).filter(Ticket.status == "Resolved").count()
    negative_interactions = db.query(Interaction).filter(Interaction.sentiment == "Negative").count()

    ticket_status_distribution = [
        {"name": "Open", "value": open_tickets},
        {"name": "In Progress", "value": db.query(Ticket).filter(Ticket.status == "In Progress").count()},
        {"name": "Resolved", "value": resolved_tickets},
        {"name": "Closed", "value": db.query(Ticket).filter(Ticket.status == "Closed").count()}
    ]

    ticket_priority_distribution = [
        {"name": "Low", "value": db.query(Ticket).filter(Ticket.priority == "Low").count()},
        {"name": "Medium", "value": db.query(Ticket).filter(Ticket.priority == "Medium").count()},
        {"name": "High", "value": db.query(Ticket).filter(Ticket.priority == "High").count()},
        {"name": "Critical", "value": db.query(Ticket).filter(Ticket.priority == "Critical").count()}
    ]

    sentiment_distribution = [
        {"name": "Positive", "value": db.query(Interaction).filter(Interaction.sentiment == "Positive").count()},
        {"name": "Neutral", "value": db.query(Interaction).filter(Interaction.sentiment == "Neutral").count()},
        {"name": "Negative", "value": negative_interactions}
    ]

    return {
        "cards": {
            "total_customers": total_customers,
            "total_tickets": total_tickets,
            "open_tickets": open_tickets,
            "resolved_tickets": resolved_tickets,
            "negative_sentiment_tickets": negative_interactions
        },
        "charts": {
            "ticket_status": ticket_status_distribution,
            "ticket_priority": ticket_priority_distribution,
            "customer_sentiment": sentiment_distribution
        }
    }
