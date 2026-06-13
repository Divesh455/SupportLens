from sqlalchemy.orm import Session
from models.memory import Memory

def store_memory(db: Session, user_id: int, text: str, memory_type: str = "interaction"):
    new_memory = Memory(
        user_id=user_id,
        memory_text=text,
        memory_type=memory_type
    )
    db.add(new_memory)
    db.commit()
    db.refresh(new_memory)
    return new_memory

def retrieve_memories(db: Session, user_id: int, query: str = None, limit: int = 5):
    memories = db.query(Memory).filter(Memory.user_id == user_id).order_by(Memory.created_at.desc()).limit(limit).all()

    if not memories:
        return "No previous memory found."

    memory_texts = [f"- {m.memory_text}" for m in memories]
    return "\n".join(memory_texts)

def get_all_user_memories(db: Session, user_id: int):
    return db.query(Memory).filter(Memory.user_id == user_id).order_by(Memory.created_at.desc()).all()
