from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from app.core.database import Base
from datetime import datetime

class Payment(Base):
    __tablename__ = "Payments"

    Id = Column(Integer, primary_key=True, index=True)
    StudentId = Column(Integer, ForeignKey("Students.StudentId", ondelete="CASCADE"), nullable=False)
    Type = Column(String(50), nullable=False) # e.g., 'Exam Fee', 'College Fee', 'Bus Fee'
    Amount = Column(Float, nullable=False)
    DueDate = Column(String(50), nullable=True) # e.g., '2026-05-01'
    Status = Column(String(20), default="Pending") # 'Pending' or 'Paid'
    PaidAt = Column(DateTime, nullable=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow)

class Salary(Base):
    __tablename__ = "Salaries"

    Id = Column(Integer, primary_key=True, index=True)
    FacultyId = Column(Integer, ForeignKey("Faculty.FacultyId", ondelete="CASCADE"), nullable=False)
    Month = Column(String(50), nullable=False) # e.g., 'March 2026'
    Amount = Column(Float, nullable=False)
    Status = Column(String(20), default="Pending") # 'Pending' or 'Paid'
    PaidAt = Column(DateTime, nullable=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
