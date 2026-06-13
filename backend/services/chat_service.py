from sqlalchemy.orm import Session
from models.interaction import Interaction
from models.ticket import Ticket
from services.groq_service import generate_chat_response, detect_ticket_intent
from services.sentiment_service import analyze_sentiment_interaction
from services.hindsight_service import retrieve_memories, store_memory

def process_chat_message(db: Session, user_id: int, message: str):
    # 1. Retrieve Memories
    memory_context = retrieve_memories(db, user_id, query=message)
    print(f"Retrieved Context for user {user_id}:\n{memory_context}")

    # 2. Analyze Sentiment
    sentiment = analyze_sentiment_interaction(message)

    # 3. Detect Ticket Intent
    intent = detect_ticket_intent(message)
    ticket_id = None
    if intent.get("needs_ticket"):
        new_ticket = Ticket(
            user_id=user_id,
            issue=message,
            category=intent.get("category", "General"),
            priority=intent.get("priority", "Medium"),
            status="Open",
            summary=f"Auto-generated ticket based on user message: {message[:50]}..."
        )
        db.add(new_ticket)
        db.commit()
        db.refresh(new_ticket)
        ticket_id = new_ticket.id

        store_memory(db, user_id, f"Created ticket #{ticket_id} for issue: {message}", "ticket")

    # 4. Generate AI Response using Context
    response_text = generate_chat_response(prompt=message, context=memory_context)

    # 5. Store Interaction
    interaction = Interaction(
        user_id=user_id,
        ticket_id=ticket_id,
        question=message,
        answer=response_text,
        sentiment=sentiment
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)

    # 6. Store Memory of this interaction
    memory_text = f"User asked: {message} | AI answered: {response_text}"
    store_memory(db, user_id, memory_text, "conversation")

    return interaction

def get_user_conversations(db: Session, user_id: int):
    return db.query(Interaction).filter(Interaction.user_id == user_id).order_by(Interaction.created_at.asc()).all()
