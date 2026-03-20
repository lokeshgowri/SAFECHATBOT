from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.security import get_db, get_current_user
from app.models.user import User
from app.models.academic import Mark, ClassSchedule

router = APIRouter()

@router.get("/overview")
def get_student_overview(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() != "student":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    marks = db.query(Mark).filter(Mark.StudentName == user.FullName).all()
    schedule = db.query(ClassSchedule).all()

    overall_attendance = "85%"
    assignments_due = 3
    sgpa = 3.8

    if marks:
        total = sum((m.Midterm + m.Final)/2 for m in marks)
        sgpa = round((total / len(marks)) / 20, 1)

    return {
        "stats": [
            {"label": "Overall Attendance", "value": overall_attendance},
            {"label": "Current SGPA", "value": str(sgpa)},
            {"label": "Assignments Due", "value": str(assignments_due)}
        ],
        "schedule": schedule
    }
