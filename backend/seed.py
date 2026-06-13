import os
import random
from datetime import datetime, timedelta
from database.db import SessionLocal, Base, engine
from models.user import User
from models.ticket import Ticket
from models.interaction import Interaction
from models.memory import Memory
from utils.security import get_password_hash

Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()

    print("Creating users...")
    users = []

    admin = User(
        name="Admin Support",
        email="admin@supportlens.com",
        password=get_password_hash("admin123"),
        company="SupportLens",
        role="admin"
    )
    db.add(admin)
    db.commit()

    for i in range(1, 21):
        user = User(
            name=f"Customer {i}",
            email=f"customer{i}@example.com",
            password=get_password_hash("password"),
            company=f"Company {i}",
            role="user"
        )
        db.add(user)
        users.append(user)
    db.commit()

    users = db.query(User).filter(User.role == "user").all()

    print("Creating tickets...")
    issues = [
        "Login failed", "Printer not working", "Payment issue",
        "API error", "Account locked", "Software crash", "Feature request", "Billing question"
    ]
    statuses = ["Open", "In Progress", "Resolved", "Closed"]
    priorities = ["Low", "Medium", "High", "Critical"]

    tickets = []
    for i in range(50):
        user = random.choice(users)
        issue_base = random.choice(issues)
        ticket = Ticket(
            user_id=user.id,
            issue=f"{issue_base} - specifics for case {i}",
            category="General",
            priority=random.choice(priorities),
            status=random.choice(statuses),
            summary=f"Summary of {issue_base}",
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
        )
        db.add(ticket)
        tickets.append(ticket)
    db.commit()

    tickets = db.query(Ticket).all()

    print("Creating conversations and memories...")
    sentiments = ["Positive", "Neutral", "Negative"]

    for i in range(100):
        user = random.choice(users)
        ticket = random.choice(tickets) if random.random() > 0.5 else None

        question = f"I am having an issue with {random.choice(issues).lower()}."
        answer = "I can help with that. Have you tried turning it off and on again?"

        interaction = Interaction(
            user_id=user.id,
            ticket_id=ticket.id if ticket else None,
            question=question,
            answer=answer,
            sentiment=random.choice(sentiments),
            created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 720))
        )
        db.add(interaction)

        memory = Memory(
            user_id=user.id,
            memory_text=f"User asked: {question} | AI answered: {answer}",
            memory_type="conversation",
            created_at=interaction.created_at
        )
        db.add(memory)

    db.commit()
    print("Seeding complete!")

if __name__ == "__main__":
    seed_data()
