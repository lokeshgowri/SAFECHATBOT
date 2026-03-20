from sqlalchemy import Column, Integer, String, Float, DateTime
from app.core.database import Base
from datetime import datetime

class Student(Base):
    __tablename__ = "Students"

    StudentId = Column(Integer, primary_key=True, index=True)
    Name = Column(String(100), nullable=False)
    Email = Column(String(100), unique=True, index=True, nullable=False)
    Major = Column(String(100))
    GPA = Column(Float)
    EnrollmentYear = Column(Integer)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
