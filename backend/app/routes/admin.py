from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.security import get_db, get_current_user
from app.models.user import User
from pydantic import BaseModel
from typing import List
from app.models.financial import Payment, Salary
from app.models.student import Student
from app.models.faculty import Faculty
from datetime import datetime

router = APIRouter()

class UserCreate(BaseModel):
    FullName: str
    Email: str
    Role: str
    Password: str = "password123"

class UserUpdate(BaseModel):
    FullName: str
    Email: str
    Role: str

class UserResponse(BaseModel):
    UserId: int
    FullName: str
    Email: str
    Role: str

    class Config:
        from_attributes = True

@router.get("/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
    return db.query(User).all()

@router.post("/users", response_model=UserResponse)
def create_user(user_data: UserCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    from app.core.security import pwd_context
    hashed_password = pwd_context.hash(user_data.Password)
    
    new_user = User(
        FullName=user_data.FullName,
        Email=user_data.Email,
        Role=user_data.Role,
        PasswordHash=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    db_user = db.query(User).filter(User.UserId == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db_user.FullName = user_data.FullName
    db_user.Email = user_data.Email
    db_user.Role = user_data.Role
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    db_user = db.query(User).filter(User.UserId == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted"}

from app.models.academic import Announcement

class AnnouncementCreate(BaseModel):
    Title: str
    Content: str
    DatePosted: str

@router.get("/announcements")
def get_announcements(db: Session = Depends(get_db)):
    return db.query(Announcement).all()

@router.post("/announcements")
def create_announcement(ann_data: AnnouncementCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.Role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    new_ann = Announcement(
        Title=ann_data.Title,
        Content=ann_data.Content,
        DatePosted=ann_data.DatePosted
    )
    db.add(new_ann)
    db.commit()
    db.refresh(new_ann)
    return new_ann

from app.models.academic import AcademicDetail, StudentResult, FeeStructure, Holiday

class DetailCreate(BaseModel):
    DetailType: str
    Description: str

@router.get("/details")
def get_details(db: Session = Depends(get_db)): return db.query(AcademicDetail).all()

@router.post("/details")
def create_detail(data: DetailCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    new_doc = AcademicDetail(DetailType=data.DetailType, Description=data.Description)
    db.add(new_doc)
    db.commit()
    return new_doc

class ResultCreate(BaseModel):
    Semester: str
    LinkFormat: str

@router.get("/results")
def get_results(db: Session = Depends(get_db)): return db.query(StudentResult).all()

@router.post("/results")
def create_result(data: ResultCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    new_doc = StudentResult(Semester=data.Semester, LinkFormat=data.LinkFormat)
    db.add(new_doc)
    db.commit()
    return new_doc

class FeeCreate(BaseModel):
    Program: str
    Amount: float
    Deadline: str

@router.get("/fees")
def get_fees(db: Session = Depends(get_db)): return db.query(FeeStructure).all()

@router.post("/fees")
def create_fee(data: FeeCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    new_doc = FeeStructure(Program=data.Program, Amount=data.Amount, Deadline=data.Deadline)
    db.add(new_doc)
    db.commit()
    return new_doc

class HolidayCreate(BaseModel):
    Date: str
    Occasion: str

@router.get("/holidays")
def get_holidays(db: Session = Depends(get_db)): return db.query(Holiday).all()

@router.post("/holidays")
def create_holiday(data: HolidayCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    new_doc = Holiday(Date=data.Date, Occasion=data.Occasion)
    db.add(new_doc)
    db.commit()
    return new_doc
