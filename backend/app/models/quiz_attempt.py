from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from app.core.database import Base
from datetime import datetime

class QuizAttempt(Base):
    __tablename__ = "QuizAttempts"

    AttemptId = Column(Integer, primary_key=True, index=True)
    QuizId = Column(Integer, ForeignKey("Quizzes.QuizId"))
    StudentId = Column(Integer, ForeignKey("Students.StudentId"))
    Score = Column(Float)
    CompletedAt = Column(DateTime, default=datetime.utcnow)
