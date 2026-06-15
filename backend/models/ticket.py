from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database.db import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    issue = Column(String, nullable=False)
    category = Column(String, nullable=True)
    priority = Column(String, default="Medium")
    status = Column(String, default="Open")
    summary = Column(String, nullable=True)
    assigned_agent_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])
    assigned_agent = relationship("User", foreign_keys=[assigned_agent_id])
