
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.models.user import User
from app.core.security import verify_password, create_access_token, get_db

router = APIRouter()


# =========================
# REQUEST MODEL
# =========================

class LoginRequest(BaseModel):
    email: str
    password: str


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
