from fastapi import Depends, HTTPException, status
from app.core.security import get_current_user
from app.models.user import User

def admin_required(current_user: User = Depends(get_current_user)):
    if current_user.Role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user