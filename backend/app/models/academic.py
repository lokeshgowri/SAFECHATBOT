from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from app.core.database import Base

class Mark(Base):
    __tablename__ = "Marks"

    MarkId = Column(Integer, primary_key=True, index=True)
    StudentId = Column(Integer, ForeignKey("Students.StudentId", ondelete="CASCADE"))
    StudentName = Column(String)
    CourseName = Column(String)
    Midterm = Column(Float, default=0.0)
    Final = Column(Float, default=0.0)

class ClassSchedule(Base):
    __tablename__ = "ClassSchedules"

    ScheduleId = Column(Integer, primary_key=True, index=True)
    CourseName = Column(String)
    Time = Column(String)
    Room = Column(String)
    Status = Column(String, default="On Time")

class Announcement(Base):
    __tablename__ = "Announcements"

    AnnouncementId = Column(Integer, primary_key=True, index=True)
    Title = Column(String)
    Content = Column(String)
    DatePosted = Column(String)

class AcademicDetail(Base):
    __tablename__ = "AcademicDetails"
    Id = Column(Integer, primary_key=True, index=True)
    DetailType = Column(String)
    Description = Column(String)

class StudentResult(Base):
    __tablename__ = "StudentResults"
    Id = Column(Integer, primary_key=True, index=True)
    Semester = Column(String)
    LinkFormat = Column(String)

class FeeStructure(Base):
    __tablename__ = "FeeStructures"
    Id = Column(Integer, primary_key=True, index=True)
    Program = Column(String)
    Amount = Column(Float)
    Deadline = Column(String)

class Holiday(Base):
    __tablename__ = "Holidays"
    Id = Column(Integer, primary_key=True, index=True)
    Date = Column(String)
    Occasion = Column(String)

class ReferenceLink(Base):
    __tablename__ = "ReferenceLinks"
    Id = Column(Integer, primary_key=True, index=True)
    Topic = Column(String)
    Url = Column(String)

class QuizSchedule(Base):
    __tablename__ = "QuizSchedules"
    Id = Column(Integer, primary_key=True, index=True)
    CourseName = Column(String)
    Date = Column(String)
    Topics = Column(String)
