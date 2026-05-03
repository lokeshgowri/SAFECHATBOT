from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.security import get_db, get_current_user
from app.models.user import User
from app.models.student import Student
from app.models.academic import Mark, ClassSchedule, ReferenceLink, QuizSchedule, Announcement, AcademicDetail, StudentResult, FeeStructure, Holiday
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
        total = sum((m.Midterm + m.Midterm2 + m.Final)/3 for m in marks)
        sgpa = round((total / len(marks)) / 20, 1)

    return {
        "stats": [
            {"label": "Overall Attendance", "value": overall_attendance},
            {"label": "Current SGPA", "value": str(sgpa)},
            {"label": "Assignments Due", "value": str(assignments_due)}
        ],
        "schedule": schedule,
        "marks": marks
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

import os

@router.get("/materials")
def get_study_materials(user: User = Depends(get_current_user)):
    if user.Role.lower() != "student":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    uploads_dir = "uploads"
    files = []
    if os.path.exists(uploads_dir):
        files = [f for f in os.listdir(uploads_dir) if f.endswith(('.pdf', '.docx', '.jpg', '.png', '.txt'))]
        
    return [{"filename": f} for f in files]

@router.get("/links")
def get_student_links(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() != "student":
        raise HTTPException(status_code=403, detail="Unauthorized")
    links = db.query(ReferenceLink).all()
    return links

@router.get("/quizzes")
def get_student_quizzes(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() != "student":
        raise HTTPException(status_code=403, detail="Unauthorized")
    quizzes = db.query(QuizSchedule).all()
    return quizzes

@router.get("/announcements")
def get_student_announcements(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() != "student":
        raise HTTPException(status_code=403, detail="Unauthorized")
    return db.query(Announcement).all()

@router.get("/details")
def get_student_details(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() != "student":
        raise HTTPException(status_code=403, detail="Unauthorized")
    return db.query(AcademicDetail).all()

@router.get("/results")
def get_student_results(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() != "student":
        raise HTTPException(status_code=403, detail="Unauthorized")
    return db.query(StudentResult).all()

@router.get("/fees")
def get_student_fees(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() != "student":
        raise HTTPException(status_code=403, detail="Unauthorized")
    return db.query(FeeStructure).all()

@router.get("/holidays")
def get_student_holidays(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() != "student":
        raise HTTPException(status_code=403, detail="Unauthorized")
    return db.query(Holiday).all()
