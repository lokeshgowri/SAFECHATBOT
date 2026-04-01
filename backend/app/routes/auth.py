
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.models.user import User
from app.models.student import Student
from app.models.faculty import Faculty
from app.models.academic import Announcement
from app.core.security import verify_password, create_access_token, get_db, get_current_user, get_password_hash

router = APIRouter()


# =========================
# REQUEST MODEL
# =========================

class LoginRequest(BaseModel):
    email: str
    password: str

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str


# =========================
# LOGIN ENDPOINT
# =========================

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    # Debug logs
    print("EMAIL RECEIVED:", data.email)
    print("PASSWORD RECEIVED:", data.password)

    # Find user
    user = db.query(User).filter(User.Email == data.email).first()

    print("USER FROM DATABASE:", user)

    if not user:
        raise HTTPException(
            status_code=400,
            detail="User not found"
        )

    # Verify password
    if not verify_password(data.password, user.PasswordHash):
        print("PASSWORD HASH IN DATABASE:", user.PasswordHash)

        raise HTTPException(
            status_code=400,
            detail="Password incorrect"
        )

    # Create JWT token
    token = create_access_token({
        "sub": user.Email
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.Role
    }


# =========================
# ADDITIONAL ENDPOINTS
# =========================

@router.put("/change-password")
def change_password(data: PasswordChangeRequest, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    if not verify_password(data.current_password, current_user.PasswordHash):
        raise HTTPException(status_code=400, detail="Current password incorrect")
    
    current_user.PasswordHash = get_password_hash(data.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


@router.get("/announcements")
def get_auth_announcements(db: Session = Depends(get_db)):
    anns = db.query(Announcement).order_by(Announcement.AnnouncementId.desc()).limit(5).all()
    return [
        {
            "Id": a.AnnouncementId,
            "Title": a.Title,
            "Content": a.Content,
            "DatePosted": a.DatePosted
        }
        for a in anns
    ]

@router.get("/me")
def get_my_profile(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    user_data = {
        "FullName": current_user.FullName,
        "Email": current_user.Email,
        "Role": current_user.Role
    }
    
    if current_user.Role == "student":
        student = db.query(Student).filter(Student.Email == current_user.Email).first()
        if student:
            user_data["EnrollmentYear"] = student.EnrollmentYear
            user_data["CurrentSemester"] = "Semester 4" # Hardcoded mockup for missing schema term
            user_data["Major"] = student.Major

    elif current_user.Role == "faculty":
        faculty = db.query(Faculty).filter(Faculty.Email == current_user.Email).first()
        if faculty:
            user_data["Department"] = faculty.Department
            user_data["Designation"] = "Professor" # Hardcoded mockup for missing schema term

    return user_data
