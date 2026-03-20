from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.core.database import Base


class Message(Base):

    __tablename__ = "Messages"

    MessageId = Column(Integer, primary_key=True)

    ConversationId = Column(Integer, ForeignKey("Conversations.ConversationId"))

    Sender = Column(String)

    Content = Column(String)

    CreatedAt = Column(DateTime)