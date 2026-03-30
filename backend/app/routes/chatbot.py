from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

from app.core.security import get_current_user, get_db
from app.models.conversation import Conversation
from app.models.message import Message
from app.services.ai_engine import stream_ai, generate_chat_title


router = APIRouter()


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
    
    # Update conversation title if it's currently "New Chat"
    conversation = db.query(Conversation).filter(Conversation.ConversationId == conversation_id).first()
    if conversation and conversation.Title == "New Chat":
        new_title = generate_chat_title(content)
        conversation.Title = new_title
        db.add(conversation)

    db.commit()


    # Load conversation history
    history = (
        db.query(Message)
        .filter(Message.ConversationId == conversation_id)
        .order_by(Message.CreatedAt)
        .all()
    )


    messages = []

    for msg in history:

        role = "user" if msg.Sender == "user" else "assistant"

        messages.append({
            "role": role,
            "content": msg.Content
        })


    async def generate():

        full_reply = ""

        for token in stream_ai(messages, user_name=user.FullName, user_role=user.Role):

            full_reply += token
            yield token


        # Save AI reply
        ai_msg = Message(
            ConversationId=conversation_id,
            Sender="ai",
            Content=full_reply,
            CreatedAt=datetime.utcnow()
        )

        db.add(ai_msg)
        db.commit()


    return StreamingResponse(generate(), media_type="text/plain")