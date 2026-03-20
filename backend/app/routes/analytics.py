from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.security import get_db, get_current_user
from app.models.user import User
from app.models.student import Student
from app.models.faculty import Faculty
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt

router = APIRouter()

@router.get("/admin")
def get_admin_analytics(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    if user.Role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized role")

    total_users = db.query(User).count()
    total_students = db.query(Student).count()
    total_faculty = db.query(Faculty).count()
    total_conversations = db.query(Conversation).count()
    total_messages = db.query(Message).count()

    return {
        "metrics": [
            {"label": "Total Users", "value": total_users},
            {"label": "Total Students", "value": total_students},
            {"label": "Total Faculty", "value": total_faculty},
            {"label": "Bot Conversations", "value": total_conversations},
            {"label": "Messages Processed", "value": total_messages}
        ]
    }

@router.get("/faculty")
def get_faculty_analytics(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    if user.Role not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Unauthorized role")

    active_students = db.query(Student).count()
    total_quizzes = db.query(Quiz).count()
    total_attempts = db.query(QuizAttempt).count()
    
    avg_score = db.query(func.avg(QuizAttempt.Score)).scalar() or 0.0

    return {
        "metrics": [
            {"label": "Enrolled Students", "value": active_students},
            {"label": "Created Quizzes", "value": total_quizzes},
            {"label": "Quiz Participations", "value": total_attempts},
            {"label": "Average Score", "value": f"{avg_score:.1f}%"}
        ]
    }
