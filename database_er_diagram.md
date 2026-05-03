# SAFECHATBOT Entity-Relationship Diagram

Below is the generated ER Diagram outlining all tables and constraints utilized across your platform. 
*(If your IDE or markdown viewer supports Mermaid.js, you will see a visual representation of the boxes and foreign keys!)*

```mermaid
erDiagram
    %% Core Identity Relationships
    USERS ||--o| STUDENTS : "Logically bound by Email"
    USERS ||--o| FACULTY : "Logically bound by Email"
    
    %% AI Chat Relationships
    USERS ||--o{ CONVERSATIONS : "Initiates"
    CONVERSATIONS ||--|{ MESSAGES : "Contains"
    
    %% Analytics Relationships
    FACULTY ||--o{ QUIZ : "Assigns"
    QUIZ ||--o{ QUIZATTEMPT : "Receives"
    STUDENTS ||--o{ QUIZATTEMPT : "Submits"

    %% Grade Link Relationships
    USERS ||--o{ MARK : "Receives (via Identity)"

    USERS {
        int UserId PK
        string FullName
        string Email UK
        string PasswordHash
        string Role
    }
    STUDENTS {
        int StudentId PK
        string Name
        string Email UK
        string Major
        float GPA
        int EnrollmentYear
        datetime CreatedAt
    }
    FACULTY {
        int FacultyId PK
        string Name
        string Email UK
        string Department
        string OfficeHours
        string RoomNumber
        datetime CreatedAt
    }

    CONVERSATIONS {
        int ConversationId PK
        int UserId FK
        string Title
        datetime CreatedAt
    }
    MESSAGES {
        int MessageId PK
        int ConversationId FK
        string Sender
        string Content
        datetime CreatedAt
    }

    QUIZ {
        int Id PK
        int FacultyId FK
        string Title
        string Course
        datetime DueDate
        datetime CreatedAt
    }
    QUIZATTEMPT {
        int Id PK
        int QuizId FK
        int StudentId FK
        float Score
        string Status
        datetime CompletedAt
    }

    MARK {
        int MarkId PK
        int UserId FK
        string Subject
        int MarksObtained
        int MaxMarks
    }

    PAYMENT {
        int Id PK
        string StudentName
        string Type
        int Amount
        string Status
    }
    SALARY {
        int Id PK
        string FacultyName
        string Month
        int Amount
        string Status
    }

    FEESTRUCTURE {
        int Id PK
        string Program
        int Amount
        string Deadline
    }

    CLASSSCHEDULE {
        int ScheduleId PK
        string CourseName
        string Time
        string Room
        string Instructor
        string Status
    }

    HOLIDAY {
        int Id PK
        string Date
        string Occasion
    }
    ANNOUNCEMENT {
        int AnnouncementId PK
        string Title
        string Content
        string DatePosted
    }
```
