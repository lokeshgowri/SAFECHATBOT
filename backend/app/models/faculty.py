from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base
from datetime import datetime

class Faculty(Base):
    __tablename__ = "Faculty"

    FacultyId = Column(Integer, primary_key=True, index=True)
    Name = Column(String(100), nullable=False)
    Email = Column(String(100), unique=True, index=True, nullable=False)
    Department = Column(String(100))
    OfficeHours = Column(String(200)) # e.g., "Mon 10am-12pm, Wed 2pm-4pm"
    RoomNumber = Column(String(50))
    CreatedAt = Column(DateTime, default=datetime.utcnow)
