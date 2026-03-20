from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.core.database import Base


class Conversation(Base):

    __tablename__ = "Conversations"

    ConversationId = Column(Integer, primary_key=True)

    UserId = Column(Integer, ForeignKey("Users.UserId"))

    Title = Column(String)

    CreatedAt = Column(DateTime)