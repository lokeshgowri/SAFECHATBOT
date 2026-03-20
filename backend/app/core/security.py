from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.core.database import SessionLocal
from app.models.user import User

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"

API_KEY_NAME = "X-API-Key"
VALID_API_KEYS = {
    "admin-safechatbot-key-2024": "Admin API Key",
}

api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def get_api_key(api_key: str = Depends(api_key_header)):
    if api_key not in VALID_API_KEYS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Could not validate API KEY"
        )
    return api_key

# password verify
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


from datetime import datetime, timedelta, timezone

# create token
def create_access_token(data: dict):

    expire = datetime.now(timezone.utc) + timedelta(days=1)

    data.update({"exp": expire})

    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


# database session
def get_db():

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# current user
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    print("AUTH HEADER:", credentials)
    print("TOKEN RECEIVED:", credentials.credentials)

    token = credentials.credentials

    try:

        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        email = payload.get("sub")

        print("TOKEN EMAIL:", email)   # DEBUG LINE

        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")

    except JWTError:

        raise HTTPException(status_code=401, detail="Token invalid")

    user = db.query(User).filter(User.Email == email).first()

    print("USER FOUND:", user)   # DEBUG LINE

    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user