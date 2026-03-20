from sqlalchemy import Column, Integer, String
from app.core.database import Base


class User(Base):

    __tablename__ = "Users"

    UserId = Column(Integer, primary_key=True)

    FullName = Column(String)

    Email = Column(String)

    PasswordHash = Column(String)

    Role = Column(String)