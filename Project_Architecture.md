# Project Architecture and Database Models

This document outlines the high-level repository structure and details all the SQL Database tables used by the SAFECHATBOT application.

## 1. Project Structure

The repository is modularly split into a Python FastAPI Backend and a React JS Frontend.

```text
SAFECHATBOT/
├── backend/                  # FastAPI Python Application
│   ├── app/
│   │   ├── ai/               # Custom Logic for RAG and LLM Chat Parsing
│   │   ├── core/             # Core setups: Database connectivity, Security (JWT/Passwords)
│   │   ├── models/           # SQLAlchemy Database Models (Schema declarations)
│   │   ├── routes/           # RESTful API Endpoints (Admin, Faculty, Student, Auth, Chatbot, Analytics)
│   │   ├── services/         # Business logic integration (e.g. AI Engine, Document upload processing)
│   │   └── main.py           # Application Entrypoint
│   └── requirements.txt      # Python Dependencies Manifest
│
├── frontend/                 # React Application
│   ├── public/               # Static GUI Assets
│   ├── src/
│   │   ├── components/       # Reusable UI Blocks (Sidebar, Navbar, Layout)
│   │   ├── pages/            # Role-Specific Dashboards (Student, Faculty, Admin, Auth, Chatbot)
│   │   ├── index.css         # Global Stylesheet using CSS variables
│   │   └── App.js            # Frontend Router implementation
│   └── package.json          # Node.js Dependencies Manifest
│
├── User_Manual.md            # Comprehensive User Guide
└── Project_Architecture.md   # Structure and Database schema documentation (This file)
```

## 2. Database Tables (SQLAlchemy Models)

The system relies on a relational database implemented via SQL Server/Postgres with SQLAlchemy ORM.

### Core Accounts
- **`User`**: The foundational identity table. Contains `UserId`, `Username`, `Email`, `PasswordHash`, and `Role` (`student`, `faculty`, `admin`).
- **`Student`**: Extension of the User table specifically for students. Contains `StudentId` (Foreign Key -> User) and academic indicators.
- **`Faculty`**: Extension of the User table securely for faculty staff profiles.

### AI Chatbot Engine
- **`Conversation`**: Tracks a user's discrete chat sessions. Contains `ConversationId`, `UserId` (Foreign Key), `Title` (AI Generated), and `CreatedAt`.
- **`Message`**: Represents an individual message in a conversation. Contains `MessageId`, `ConversationId` (Foreign Key), `Sender` (User vs. AI), and `Content`.
- **`Resource`**: References uploaded documents indexed by the RAG Engine. Contains `ResourceId`, `Filename`, `Content` (extracted text), and timestamps.

### Academic Operations
- **`Mark`**: Tracks student grades. Specifies `MarkId`, `StudentName`, `CourseName`, `Midterm`, and `Final` scores.
- **`ClassSchedule`**: Controls dynamic room layouts. Specifies `ScheduleId`, `CourseName`, `Time`, `Room`, and dynamic `Status` (On Time, Delayed, Canceled).
- **`Announcement`**: Stores urgent broadcast messages globally distributed to all portals.
- **`AcademicDetail`**: Stores rich descriptions for structural curriculum updates.
- **`StudentResult`**: Provides secure routing to exam records (`Semester`, `LinkFormat`).
- **`FeeStructure`**: Allows admins to define official payment structures (`Program`, `Amount`, `Deadline`).
- **`Holiday`**: Maintains university calendar exceptions securely in the DB.
- **`ReferenceLink`**: Allows faculty to link arbitrary URLs logically linked to courses.

### Quizzes and Analytics
- **`QuizSchedule`**: Specifies active test-taking windows (`Date`, `CourseName`, `Topics`).
- **`Quiz`**: Faculty database configurations representing an exam template (Title, Subject, PassMarks).
- **`QuizAttempt`**: Represents a student's final score securely for analytics aggregation (`QuizId`, `UserId`, `Score`).

### Financials
- **`Payment`**: Tracking log for student fee dues. Includes `Type` (Exam Fee, Hostel Fee), `Amount`, `StudentName`, `DueDate`, and `Status` (Pending/Paid).
- **`Salary`**: Disbursement registry tracking compensation for academic personnel. Includes `Month`, `FacultyName`, `Amount`, `PaidAt`, and `Status` (Pending/Paid).
