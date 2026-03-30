# SAFECHATBOT User Manual

Welcome to the SAFECHATBOT system! This comprehensive platform provides an AI-powered academic assistant alongside a centralized dashboard for Students, Faculty, and Administrators. 

## Table of Contents
1. [General Overview](#general-overview)
2. [Student Guide](#student-guide)
3. [Faculty Guide](#faculty-guide)
4. [Administrator Guide](#administrator-guide)
5. [AI Assistant Features](#ai-assistant-features)

---

## 1. General Overview
The SAFECHATBOT platform combines an intelligent LLM-based query engine with operational dashboards. Users can log in using their credentials and will be automatically routed to their respective portals based on their assigned role: **Student**, **Faculty**, or **Admin**.

**Key Hubs:**
- **Chat Interface:** For instant answers regarding schedule, grades, and campus info.
- **Portals:** Dedicated interfaces for managing academic workflows securely.

---

## 2. Student Guide

**Accessing Your Account**
- Navigate to the login screen and enter your student credentials. You will be routed to the `Student Dashboard`.

**Dashboard Modules:**
- **Academic Summary:** View your Cumulative CGPA, current Semester GPA, and Overall Attendance directly from the top widgets. Click the widgets to open detailed Modal breakdowns.
- **Schedule:** See your real-time classes for the day with live room assignments and status updates (On Time, Delayed, Canceled).
- **Study Materials & Assignments:** Keep track of upcoming due assignments and access uploaded campus reference links and notes.
- **Financial Dues (New!):** Click on the red **Fee Dues** widget to view any outstanding payments (e.g., Exam Fees, Tuition). You can simulate online payments securely from this portal by clicking **Pay Now**.

---

## 3. Faculty Guide

**Accessing Your Account**
- Login with Faculty credentials to access the `Faculty Dashboard`.

**Dashboard Modules:**
- **Grade Management:** Assign and update Midterm and Final grades for students. These grades are instantly reflected in the student's CGPA calculations.
- **Scheduling:** Create or update class schedules. If a class is delayed or canceled, update the status here to notify students immediately.
- **Resource Processing:** Upload study materials (PDF, DOCX) through the RAG engine integration so the AI Chatbot can learn from your curriculum.
- **Assessments:** Schedule quizzes and specify the topics covered so students can prepare.
- **My Salary Log (New!):** Click the **My Salary Log** tab to view your compensation history. Check the disbursement dates and verify if your monthly salary has been categorized as Pending or Paid by the administration.

---

## 4. Administrator Guide

**Accessing Your Account**
- Login with Admin credentials to access the high-level `Admin Console`.

**Dashboard Modules:**
- **User Directory:** Insert, Update, or Delete users from the SQL database. Assign roles (Student, Faculty, Admin).
- **Announcements:** Post urgent global transmissions that will appear for all users.
- **Fee Structures:** Set up new payment structures and deadlines for the student body.
- **Holidays & Results:** Regulate the university calendar and publish examination result links.
- **Financials (New!):** Monitor all cash flow. 
  - **Student Payments Ledger:** Verify which students have cleared their academic dues.
  - **Faculty Salary Disbursement:** Review pending salaries and click **Pay Salary** to authorize and timestamp faculty compensation.

---

## 5. AI Assistant Features

The Chatbot is accessible via the sidebar and serves as your 24/7 assistant.

**Capabilities:**
- **Personalized Academic Answers:** Ask "What is my attendance?" or "What is my current CGPA?" The AI will retrieve your specific records from the database instead of giving generic answers.
- **Context-Aware Titles (New!):** When you start a New Chat, the AI will briefly read your first message and automatically generate a short, contextual title (e.g., "AI Exam Eligibility") for your history sidebar.
- **Conversation History:** You can access up to your last conversations seamlessly.
- **General Knowledge:** The AI is powered by Ollama and can answer general queries just like a standard LLM, ensuring you have a widely capable assistant.
