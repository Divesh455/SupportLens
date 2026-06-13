from sqlalchemy.orm import Session
from services.ticket_service import get_user_tickets
from services.chat_service import get_user_conversations
from services.hindsight_service import get_all_user_memories

def get_user_history(db: Session, user_id: int):
    tickets = get_user_tickets(db, user_id)
    conversations = get_user_conversations(db, user_id)
    memories = get_all_user_memories(db, user_id)

    sentiment_counts = {"Positive": 0, "Neutral": 0, "Negative": 0}
    for conv in conversations:
        if conv.sentiment in sentiment_counts:
            sentiment_counts[conv.sentiment] += 1

    return {
        "user_id": user_id,
        "tickets": [
            {
                "id": t.id,
                "issue": t.issue,
                "status": t.status,
                "priority": t.priority,
                "created_at": t.created_at
            } for t in tickets
        ],
        "conversations": [
            {
                "id": c.id,
                "question": c.question,
                "answer": c.answer,
                "sentiment": c.sentiment,
                "created_at": c.created_at
            } for c in conversations
        ],
        "memories": [
            {
                "id": m.id,
                "memory_text": m.memory_text,
                "memory_type": m.memory_type,
                "created_at": m.created_at
            } for m in memories
        ],
        "sentiment_history": sentiment_counts
    }
