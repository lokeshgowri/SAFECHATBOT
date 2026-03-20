import ollama


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
        "2. If requested data is not available, you must ONLY respond with: 'The requested information is not available right now.' Do NOT guess or assume missing data.\n"
        "3. If a user tries an unauthorized action or attempts to access data outside their role permissions, you must ONLY respond with: 'You do not have permission to perform this action.'\n"
        "4. Be polite, direct IT problems to IT Support, academic records to the Registrar, and stressed students to the Counseling Center.\n"
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


# ---------------------------------------------------
# INTENT DETECTION
# ---------------------------------------------------
def detect_intent(message: str):
    msg = message.lower()

    if "password" in msg or "login problem" in msg:
        return "IT_SUPPORT"

    if "grade" in msg or "transcript" in msg:
        return "REGISTRAR"

    if "stress" in msg or "anxiety" in msg:
        return "COUNSELING"

    if "library" in msg:
        return "LIBRARY"

    if "eligible" in msg or "semester 5" in msg:
        return "EXAM_ELIGIBILITY"
        
    if "credits" in msg or "graduate" in msg:
        return "GRADUATION"
        
    if "supplementary" in msg:
        return "SUPPLEMENTARY"
        
    if "tc" in msg or "transfer certificate" in msg:
        return "TC"

    return None


def handle_intent(intent):
    responses = {
        "IT_SUPPORT": "For login or technical issues please contact IT Support through the campus helpdesk portal.",
        "REGISTRAR": "For academic records or transcripts please contact the Registrar's Office.",
        "COUNSELING": "If you are feeling stressed please consider visiting the Counseling Center for support.",
        "LIBRARY": "For library timings and resources please check the campus portal or visit the library.",
        "EXAM_ELIGIBILITY": "To be eligible for Semester 5 exams, you must have cleared your core subjects from previous semesters and maintain a minimum attendance of 75%. Check your specific status on the Student Dashboard.",
        "GRADUATION": "You typically require 160 credits to graduate depending on your selected program. Please consult your Academic Details tab for your official progress evaluation.",
        "SUPPLEMENTARY": "Supplementary exams are traditionally scheduled 4 weeks after the regular semester results are declared. Check the Announcements tab on your dashboard for the official calendar.",
        "TC": "To request a Transfer Certificate (TC), you must submit a No Dues certificate, your previous semester marks memos, and a formal request letter to the Registrar's Office."
    }

    return responses.get(intent)


# ---------------------------------------------------
# MAIN AI FUNCTION
# ---------------------------------------------------
def stream_ai(messages, user_name=None, user_role=None):

    last_user_msg = ""

    for msg in reversed(messages):
        if isinstance(msg, dict) and msg.get("role") == "user":
            last_user_msg = msg.get("content", "")
            break

    # ---------------------------------------------------
    # INTENT ROUTING
    # ---------------------------------------------------
    intent = detect_intent(last_user_msg)

    if intent:
        response = handle_intent(intent)
        if response:
            yield response
            return

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
    # LLM CALL
    # ---------------------------------------------------
    stream = ollama.chat(
        model="llama3.2",
        messages=messages,
        stream=True
    )

    # ---------------------------------------------------
    # STREAM RESPONSE
    # ---------------------------------------------------
    for chunk in stream:
        content = chunk.get("message", {}).get("content", "")
        if content:
            yield content

    # ---------------------------------------------------
    # SOURCE CITATION
    # ---------------------------------------------------
    user_asked_sources = any(w in last_user_msg.lower() for w in ["source", "reference", "citation", "document", "where did"])
    if sources and user_asked_sources:
        yield "\n\nSources:\n"
        for s in set(sources):
            yield f"- {s}\n"    