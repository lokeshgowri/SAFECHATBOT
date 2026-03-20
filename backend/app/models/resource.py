from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base
from datetime import datetime

class Resource(Base):
    __tablename__ = "Resources"

    ResourceId = Column(Integer, primary_key=True, index=True)
    Name = Column(String(100), nullable=False)
    Type = Column(String(50)) # e.g., "Library", "Counseling", "IT Support"
    Description = Column(String(500))
    Location = Column(String(200))
    OperatingHours = Column(String(200))
    ContactEmail = Column(String(100))
    CreatedAt = Column(DateTime, default=datetime.utcnow)
