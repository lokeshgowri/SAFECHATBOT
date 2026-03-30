from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.security import get_db, get_current_user
from app.models.user import User
from app.models.student import Student
from app.models.academic import Mark, ClassSchedule
from app.models.financial import Payment
from datetime import datetime

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


@router.get("/dues")
def get_student_dues(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() != "student":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    student = db.query(Student).filter(Student.Email == user.Email).first()
    if not student:
        return []
    
    dues = db.query(Payment).filter(Payment.StudentId == student.StudentId).all()
    # Mock some data if empty for demonstration
    if not dues:
        mock_due = Payment(StudentId=student.StudentId, Type="Semester Fee", Amount=45000, DueDate="2026-06-01", Status="Pending")
        mock_due2 = Payment(StudentId=student.StudentId, Type="Exam Fee", Amount=1500, DueDate="2026-05-15", Status="Pending")
        db.add(mock_due)
        db.add(mock_due2)
        db.commit()
        dues = [mock_due, mock_due2]

    return dues

@router.post("/dues/{due_id}/pay")
def pay_student_due(due_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() != "student":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    due = db.query(Payment).filter(Payment.Id == due_id).first()
    if not due:
        raise HTTPException(status_code=404, detail="Due not found")
        
    due.Status = "Paid"
    due.PaidAt = datetime.utcnow()
    db.commit()
    db.refresh(due)
    
    return {"message": "Payment successful", "due": due}
