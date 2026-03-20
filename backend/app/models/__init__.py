from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.student import Student
from app.models.faculty import Faculty
from app.models.resource import Resource
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.academic import Mark, ClassSchedule, Announcement, AcademicDetail, StudentResult, FeeStructure, Holiday, ReferenceLink, QuizSchedule

# Expose models for easier imports and database initialization
__all__ = ["User", "Conversation", "Message", "Student", "Faculty", "Resource", "Quiz", "QuizAttempt", "Mark", "ClassSchedule", "Announcement", "AcademicDetail", "StudentResult", "FeeStructure", "Holiday", "ReferenceLink", "QuizSchedule"]
