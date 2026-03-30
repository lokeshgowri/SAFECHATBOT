from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.security import get_db, get_current_user
from app.models.user import User
from app.models.academic import Mark, ClassSchedule
from pydantic import BaseModel
from typing import List
from app.models.financial import Salary
from app.models.faculty import Faculty

router = APIRouter()

class MarkUpdate(BaseModel):
    Midterm: float
    Final: float

@router.get("/marks")
def get_marks(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() not in ["admin", "faculty", "student"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return db.query(Mark).all()

class MarkCreate(BaseModel):
    StudentName: str
    CourseName: str
    Midterm: float
    Final: float

@router.post("/marks")
def create_mark(mark_data: MarkCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    db_student = db.query(User).filter(User.FullName == mark_data.StudentName).first()
    student_id = db_student.UserId if db_student else 0
        
    new_mark = Mark(
        StudentId=student_id,
        StudentName=mark_data.StudentName,
        CourseName=mark_data.CourseName,
        Midterm=mark_data.Midterm,
        Final=mark_data.Final
    )
    db.add(new_mark)
    db.commit()
    db.refresh(new_mark)
    return new_mark

@router.put("/marks/{mark_id}")
def update_mark(mark_id: int, mark_data: MarkUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    db_mark = db.query(Mark).filter(Mark.MarkId == mark_id).first()
    if not db_mark:
        raise HTTPException(status_code=404, detail="Mark not found")
        
    db_mark.Midterm = mark_data.Midterm
    db_mark.Final = mark_data.Final
    db.commit()
    db.refresh(db_mark)
    return db_mark

@router.get("/schedule")
def get_schedule(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(ClassSchedule).all()

class ScheduleCreate(BaseModel):
    CourseName: str
    Time: str
    Room: str

@router.post("/schedule")
def create_schedule(schedule_data: ScheduleCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    new_schedule = ClassSchedule(
        CourseName=schedule_data.CourseName,
        Time=schedule_data.Time,
        Room=schedule_data.Room,
        Status="On Time"
    )
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)
    return new_schedule

@router.put("/schedule/{schedule_id}")
def update_schedule_status(schedule_id: int, status: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() not in ["admin", "faculty"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    db_class = db.query(ClassSchedule).filter(ClassSchedule.ScheduleId == schedule_id).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found")
        
    db_class.Status = status
    db.commit()
    db.refresh(db_class)
    return db_class

from app.models.academic import ReferenceLink, QuizSchedule

class LinkCreate(BaseModel):
    Topic: str
    Url: str

@router.get("/links")
def get_links(db: Session = Depends(get_db)): return db.query(ReferenceLink).all()

@router.post("/links")
def create_link(data: LinkCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    new_doc = ReferenceLink(Topic=data.Topic, Url=data.Url)
    db.add(new_doc)
    db.commit()
    return new_doc

class QuizSchedCreate(BaseModel):
    CourseName: str
    Date: str
    Topics: str

@router.get("/quizzes")
def get_quizzes(db: Session = Depends(get_db)): return db.query(QuizSchedule).all()

@router.post("/quizzes")
def create_quiz(data: QuizSchedCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    new_doc = QuizSchedule(CourseName=data.CourseName, Date=data.Date, Topics=data.Topics)
    db.add(new_doc)
    db.commit()
    return new_doc

@router.get("/salary")
def get_faculty_salary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() != "faculty":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    faculty = db.query(Faculty).filter(Faculty.Email == user.Email).first()
    if not faculty:
        return []
    
    salaries = db.query(Salary).filter(Salary.FacultyId == faculty.FacultyId).all()
    # Mock data if empty
    if not salaries:
        mock_salary = Salary(FacultyId=faculty.FacultyId, Month="March 2026", Amount=80000, Status="Pending")
        db.add(mock_salary)
        db.commit()
        salaries = [mock_salary]

    return salaries
