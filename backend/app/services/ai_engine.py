import ollama
import os

try:
    import google.generativeai as genai
except ImportError:
    genai = None

from dotenv import load_dotenv
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY and genai:
    genai.configure(api_key=GEMINI_API_KEY)


SYSTEM_PROMPT = {
    "role": "system",
    "content": (
        "You are the official Student Admin and Faculty Chatbot (SAFECHATBOT) for the college management system.\n"
        "Your behavior, permissions, and responses must strictly depend on the user's role: Student, Faculty, or Admin.\n\n"
        "--- ROLE DEFINITIONS ---\n"
        "1. STUDENT:\n"
        "   - Can view: Marks, Attendance, Class timings, Notes and study materials, Reference websites, Quiz schedules, Fee structure, Semester results, Academic details, Holidays and college updates.\n"
        "   - Cannot: Modify or upload any data. Cannot add/remove users or perform admin actions.\n\n"
        "2. FACULTY:\n"
        "   - Can do: Upload and manage student marks, Upload class timings, Upload notes, Share reference websites, Schedule quizzes, Update class status.\n"
        "   - Cannot: Perform admin-level operations like adding students or faculty.\n\n"
        "3. ADMIN:\n"
        "   - Has full control.\n"
        "   - Can do: Add or remove students and faculty, Upload academic details, Upload semester results, Update fee structures, Post college-wide announcements, Manage holiday calendars, Override or update any existing data.\n\n"
        "--- RESPONSE RULES ---\n"
        "1. Give clear, concise, and helpful answers mapping questions to stored data.\n"
        "2. Answering general knowledge questions (like who is a prime minister or chief minister) is ALLOWED. Do NOT say the user doesn't have permission to ask general questions. Provide the answer directly without any warnings.\n"
        "3. If requested academic or college data is not available, state that it's unavailable.\n"
        "4. If a user explicitly tries to perform an unauthorized action (like an admin action while being a student), you must ONLY respond with: 'You do not have permission to perform this action.'\n"
        "5. Be polite, direct IT problems to IT Support, academic records to the Registrar, and stressed students to the Counseling Center.\n"
        "6. ALWAYS provide a response. Never return an empty answer. Be robust to typos, misspellings, and informal language. Do your absolute best to interpret the user's intent from their query, even if it has spelling mistakes or is poorly phrased, and provide an answer based on the provided context.\n"
        "7. If the user replies with a simple conversational phrase like 'yes', 'no', or 'thank you', reply naturally. If they say 'yes', fulfill what you offered in your previous message.\n"
    )
}


# ---------------------------------------------------
# PROMPT INJECTION PROTECTION
# ---------------------------------------------------
def sanitize_context(text):
    blocked = [
        "ignore previous instructions",
        "reveal system prompt",
        "act as",
        "pretend to be"
    ]

    lower = text.lower()

    for phrase in blocked:
        if phrase in lower:
            text = text.replace(phrase, "")

    return text


# Intent detection has been removed to allow LLM to dynamically fetch DB models


# ---------------------------------------------------
# CHAT TITLE GENERATION
# ---------------------------------------------------
def generate_chat_title(first_message: str) -> str:
    try:
        prompt = f"Summarize this user message into a concise 3-4 word title. Respond ONLY with the title and nothing else. No quotes:\nUser: {first_message}"
        
        if GEMINI_API_KEY and genai:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            title = response.text.strip(' \n"')
        else:
            response = ollama.chat(
                model="llama3.2",
                messages=[{"role": "user", "content": prompt}],
                stream=False
            )
            title = response.get("message", {}).get("content", "").strip(' \n"')
        
        if not title or len(title) > 50:
            return first_message[:30] + ("..." if len(first_message) > 30 else "")
            
        return title
    except Exception as e:
        print("Error generating chat title:", e)
        return first_message[:30] + ("..." if len(first_message) > 30 else "")


# ---------------------------------------------------
# MAIN AI FUNCTION
# ---------------------------------------------------
def stream_ai(messages, user_name=None, user_role=None, user_email=None, db=None):

    last_user_msg = ""

    for msg in reversed(messages):
        if isinstance(msg, dict) and msg.get("role") == "user":
            last_user_msg = msg.get("content", "")
            break

    # ---------------------------------------------------
    # BUILD SYSTEM PROMPT
    # ---------------------------------------------------
    final_system_prompt = dict(SYSTEM_PROMPT)

    if user_name and user_role:
        user_context = (
            f"\nCurrent User Context:\n"
            f"Name: {user_name}\n"
            f"Role: {user_role}\n"
            "Personalize responses when helpful.\n"
        )
        if db and user_role.lower() == "student" and user_email:
            try:
                from app.models.academic import Mark, ClassSchedule, Announcement, FeeStructure, Holiday, QuizSchedule, AcademicDetail
                from app.models.student import Student
                from app.models.financial import Payment
                
                # Mock hardcoded values that were also mapped in the overview endpoint
                user_context += "Overall Attendance: 85%\nAssignments Due: 3\n"
                
                # Dues
                student = db.query(Student).filter(Student.Email == user_email).first()
                if student:
                    user_context += f"Major: {student.Major}, Enrollment Year: {student.EnrollmentYear}\n"
                    dues = db.query(Payment).filter(Payment.StudentId == student.StudentId).all()
                    if dues:
                        user_context += "\n[Fee Dues]:\n"
                        for d in dues:
                            user_context += f"- {d.Type}: Amt: {d.Amount}, Due: {d.DueDate}, Status: {d.Status}\n"
                
                # Marks and SGPA
                marks = db.query(Mark).filter(Mark.StudentName == user_name).all()
                if marks:
                    total = sum((m.Midterm + m.Midterm2 + m.Final)/3 for m in marks)
                    sgpa = round((total / len(marks)) / 20, 1)
                    user_context += f"SGPA: {sgpa}\n\n[Marks]:\n"
                    for m in marks:
                        user_context += f"- {m.CourseName}: Midterm [{m.Midterm}, {m.Midterm2}], Final {m.Final}\n"
                        
                # Schedules
                schedules = db.query(ClassSchedule).all()
                if schedules:
                    user_context += "\n[Class Schedule]:\n"
                    for s in schedules:
                        user_context += f"- {s.CourseName}: {s.Time} in {s.Room} (Status: {s.Status})\n"
                        
                # Holidays
                holidays = db.query(Holiday).limit(3).all()
                if holidays:
                    user_context += "\n[Upcoming Holidays]:\n"
                    for h in holidays:
                        user_context += f"- {h.Occasion} on {h.Date}\n"
                
                # Announcements
                announcements = db.query(Announcement).limit(3).all()
                if announcements:
                    user_context += "\n[Announcements]:\n"
                    for a in announcements:
                        user_context += f"- {a.Title}: {a.Content} (Posted: {a.DatePosted})\n"
                        
                # Quizzes
                quizzes = db.query(QuizSchedule).limit(3).all()
                if quizzes:
                    user_context += "\n[Quiz Schedule]:\n"
                    for q in quizzes:
                        user_context += f"- {q.CourseName}: {q.Topics} (Date: {q.Date})\n"
                # FeeStructure
                fee_structures = db.query(FeeStructure).all()
                if fee_structures:
                    user_context += "\n[Fee Structure]:\n"
                    for f in fee_structures:
                        user_context += f"- {f.ProgramName}: {f.Amount} (Details: {f.Details})\n"
                
                # Academic details
                academic_details = db.query(AcademicDetail).limit(3).all()
                if academic_details:
                    user_context += "\n[Academic Details]:\n"
                    for ad in academic_details:
                        user_context += f"- {ad.Title}: {ad.Description}\n"

            except Exception as e:
                print("Error injecting db context into Prompt:", e)

        final_system_prompt["content"] += user_context

    context_text = ""
    sources = []

    try:
        from app.ai.rag_engine import get_vector_store

        vector_store = get_vector_store()

        if vector_store and last_user_msg:

            docs = vector_store.similarity_search(last_user_msg, k=3)

            if docs:

                context_text += "\n\n=== DOCUMENT CONTEXT ===\n"

                for i, doc in enumerate(docs):

                    excerpt = sanitize_context(doc.page_content)

                    source = doc.metadata.get("source", "Unknown")
                    page = doc.metadata.get("page", "N/A")

                    context_text += f"[Excerpt {i+1}]: {excerpt}\n"

                    sources.append(f"{source} (Page {page})")

                context_text += "========================\n"

    except Exception as e:
        print("Vector search error:", e)

    if context_text:
        final_system_prompt["content"] += context_text

    # ---------------------------------------------------
    # ENSURE SYSTEM MESSAGE FIRST
    # ---------------------------------------------------
    if not messages or messages[0].get("role") != "system":
        messages.insert(0, final_system_prompt)

    # ---------------------------------------------------
    # LLM CALL (Gemini cloud or Ollama local)
    # ---------------------------------------------------
    
    if GEMINI_API_KEY and genai:
        try:
            sys_text = final_system_prompt["content"]
            model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=sys_text)
            
            gemini_messages = []
            for msg in messages:
                if msg.get("role") == "system":
                    continue
                role = "model" if msg.get("role") == "assistant" else "user"
                gemini_messages.append({"role": role, "parts": [msg.get("content")]})
                
            stream = model.generate_content(gemini_messages, stream=True)
            for chunk in stream:
                if chunk.text:
                    yield chunk.text
                    
            user_asked_sources = any(w in last_user_msg.lower() for w in ["source", "reference", "citation", "document", "where did"])
            if sources and user_asked_sources:
                yield "\n\nSources:\n"
                for s in set(sources):
                    yield f"- {s}\n"
            return
        except Exception as e:
            print("Gemini API Error, falling back to Ollama:", e)

    try:
        stream = ollama.chat(
            model="llama3.2",
            messages=messages,
            stream=True,
            options={"num_ctx": 8192}
        )

        # ---------------------------------------------------
        # STREAM RESPONSE
        # ---------------------------------------------------
        has_yielded = False
        for chunk in stream:
            if "error" in chunk:
                raise Exception(chunk["error"])
            content = chunk.get("message", {}).get("content", "")
            if content:
                has_yielded = True
                yield content
                
        if not has_yielded:
            yield "I couldn't generate a clear response for that. Could you provide a bit more context?"

    except Exception as e:
        print("Ollama API Error:", e)
        yield f"⚠️ Sorry, there was an issue communicating with the AI model. Ensure Ollama is running correctly. Error: {e}"

    # ---------------------------------------------------
    # SOURCE CITATION
    # ---------------------------------------------------
    user_asked_sources = any(w in last_user_msg.lower() for w in ["source", "reference", "citation", "document", "where did"])
    if sources and user_asked_sources:
        yield "\n\nSources:\n"
        for s in set(sources):
            yield f"- {s}\n"    