from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.core.database import Base
from datetime import datetime

class Quiz(Base):
    __tablename__ = "Quizzes"

    QuizId = Column(Integer, primary_key=True, index=True)
    Title = Column(String(255), index=True)
    FacultyId = Column(Integer, ForeignKey("Faculty.FacultyId"))
    CreatedAt = Column(DateTime, default=datetime.utcnow)