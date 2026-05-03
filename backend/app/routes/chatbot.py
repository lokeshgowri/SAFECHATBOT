from fastapi import APIRouter, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
import logging

logger = logging.getLogger(__name__)

from app.core.security import get_current_user, get_db
from app.core.database import SessionLocal
from app.models.conversation import Conversation
from app.models.message import Message
from app.services.ai_engine import stream_ai, generate_chat_title


router = APIRouter()

def update_chat_title_bg(conversation_id: int, content: str):
    db_session = SessionLocal()
    try:
        conversation = db_session.query(Conversation).filter(Conversation.ConversationId == conversation_id).first()
        if conversation and conversation.Title == "New Chat":
            new_title = generate_chat_title(content)
            conversation.Title = new_title
            db_session.commit()
    except Exception as e:
        logger.error(f"Error generating background chat title: {e}")
    finally:
        db_session.close()


# =========================
# Request Model
# =========================

class ChatRequest(BaseModel):
    conversationId: Optional[int] = None
    message: str


# =========================
# Get Conversations
# =========================

@router.get("/conversations")
def get_conversations(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):

    conversations = (
        db.query(Conversation)
        .filter(Conversation.UserId == user.UserId)
        .order_by(Conversation.CreatedAt.desc())
        .all()
    )

    return conversations


# =========================
# Create Conversation
# =========================

@router.post("/conversations")
def create_conversation(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):

    conversation = Conversation(
        UserId=user.UserId,
        Title="New Chat",
        CreatedAt=datetime.utcnow()
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


# =========================
# Get Messages for Conversation
# =========================

@router.get("/conversations/{conversation_id}/messages")
def get_conversation_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):

    messages = (
        db.query(Message)
        .filter(Message.ConversationId == conversation_id)
        .order_by(Message.CreatedAt)
        .all()
    )

    return [{"sender": msg.Sender, "text": msg.Content} for msg in messages]


# =========================
# Send Message
# =========================

@router.post("/message")
async def send_message(
    data: ChatRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):

    conversation_id = data.conversationId
    content = data.message


    # If conversation not provided → get latest
    if conversation_id is None:

        conversation = (
            db.query(Conversation)
            .filter(Conversation.UserId == user.UserId)
            .order_by(Conversation.CreatedAt.desc())
            .first()
        )

        if not conversation:

            conversation = Conversation(
                UserId=user.UserId,
                Title="New Chat",
                CreatedAt=datetime.utcnow()
            )

            db.add(conversation)
            db.commit()
            db.refresh(conversation)

        conversation_id = conversation.ConversationId


    # Save user message
    user_msg = Message(
        ConversationId=conversation_id,
        Sender="user",
        Content=content,
        CreatedAt=datetime.utcnow()
    )

    db.add(user_msg)
    
    # Update conversation title in the background if it's "New Chat"
    conversation = db.query(Conversation).filter(Conversation.ConversationId == conversation_id).first()
    if conversation and conversation.Title == "New Chat":
        background_tasks.add_task(update_chat_title_bg, conversation_id, content)


    # Load conversation history, limiting to last 10 messages to prevent context window overflow
    history_query = (
        db.query(Message)
        .filter(Message.ConversationId == conversation_id)
        .order_by(Message.CreatedAt.desc())
        .limit(10)
        .all()
    )
    
    # Reverse to maintain chronological order
    history = list(reversed(history_query))


    messages = []

    for msg in history:

        role = "user" if msg.Sender == "user" else "assistant"

        messages.append({
            "role": role,
            "content": msg.Content
        })


    async def generate():
        full_reply = ""
        try:
            for token in stream_ai(messages, user_name=user.FullName, user_role=user.Role, user_email=user.Email, db=db):
                full_reply += token
                yield token

            # Save AI reply
            if full_reply:
                ai_msg = Message(
                    ConversationId=conversation_id,
                    Sender="ai",
                    Content=full_reply,
                    CreatedAt=datetime.utcnow()
                )
                db.add(ai_msg)
                db.commit()
        except Exception as e:
            logger.error(f"AI Stream Error: {e}")
            error_msg = f"Sorry, there was an issue communicating with the AI model. Ensure Ollama is running correctly. Error: {e}"
            yield error_msg


    return StreamingResponse(generate(), media_type="text/plain")