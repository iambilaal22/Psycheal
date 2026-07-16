import os
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session

from app.config import settings
from app.db.session import engine, Base, get_db
from app.db import models
from app.services.ai_service import ai_service
from app.services.voice_service import voice_service
from app.services.memory_service import memory_service

# Auto-create tables in PostgreSQL / SQLite upon server boot
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Psycheal high-fidelity mental wellness modular backend architecture."
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Request/Response Models ---
class ChatMessage(BaseModel):
    sender: str
    text: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    userId: Optional[str] = "bilaallive2021"

class VoiceReplyRequest(BaseModel):
    transcript: str
    voiceName: Optional[str] = "rachel"
    voiceTone: Optional[str] = "soothing"
    userId: Optional[str] = "bilaallive2021"

class TTSRequest(BaseModel):
    text: str
    voiceName: Optional[str] = "rachel"

class MemoryCreate(BaseModel):
    text: str
    category: str
    userId: Optional[str] = "bilaallive2021"

# --- SYSTEM PROMPT ---
PSYCHEAL_SYSTEM_INSTRUCTION = """You are "PsycHeal", an advanced, highly empathetic, and professional AI psychological wellness assistant. 
Your goal is to offer a safe, warm, and supportive environment for self-reflection, emotional grounding, and mental wellness.
You practice active listening: validate the user's emotions, show deep compassion, and ask thoughtful open-ended questions.
You incorporate Cognitive Behavioral Therapy (CBT) principles, mindfulness grounding, and solution-focused techniques without sounding clinical or clinical-diagnosing.
CRITICAL DIRECTIONS:
1. ALWAYS remain kind, calm, gentle, and slow-paced.
2. Avoid generic, dry, or clinical-robotic lists. Write like a warm, supportive friend or a wise companion.
3. Keep your replies concise and easy to read so they are perfect for speech or text.
4. CLINICAL DISCLAIMER: If the user is in immediate crisis, self-harm, or severe distress, gently guide them to our Crisis Support resources and local emergency services immediately. Never play the role of a licensed medical clinician or psychiatrist."""

# --- ENDPOINTS ---

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "active"
    try:
        db.execute("SELECT 1")
    except Exception:
        db_status = "disconnected"
    return {
        "status": "healthy",
        "database": db_status,
        "ai_provider": settings.AI_PROVIDER,
        "elevenlabs": "configured" if settings.ELEVENLABS_API_KEY else "unconfigured"
    }

@app.get("/api/check-key")
def check_configuration(db: Session = Depends(get_db)):
    is_postgres = not engine.url.database.endswith("sql_app.db") if engine.url.database else False
    return {
        "configured": bool(settings.GEMINI_API_KEY),
        "elevenLabsConfigured": bool(settings.ELEVENLABS_API_KEY),
        "aiProvider": settings.AI_PROVIDER,
        "databaseType": "PostgreSQL" if is_postgres else "SQLite/File DB"
    }

@app.post("/api/chat")
async def chat_handler(payload: ChatRequest, db: Session = Depends(get_db)):
    if not payload.messages:
        raise HTTPException(status_code=400, detail="Invalid messages array")
    
    try:
        # 1. Retrieve the user's long-term personalized memories to form context
        memory_context = await memory_service.compile_context_for_prompt(db, payload.userId)
        full_system_instruction = f"{PSYCHEAL_SYSTEM_INSTRUCTION}{memory_context}"

        # Convert pydantic messages list to list of dicts for AI service
        messages_list = [{"sender": m.sender, "text": m.text} for m in payload.messages]

        # 2. Generate content via our pluggable AI Service
        reply_text = await ai_service.generate(messages_list, full_system_instruction)

        # 3. Asynchronously extract and store any new memories from the user's input
        last_user_message = payload.messages[-1].text
        if last_user_message:
            await memory_service.auto_extract_and_store(db, payload.userId, last_user_message, reply_text)

        return {"text": reply_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate response: {str(e)}")

@app.post("/api/voice-reply")
async def voice_reply_handler(payload: VoiceReplyRequest, db: Session = Depends(get_db)):
    try:
        memory_context = await memory_service.compile_context_for_prompt(db, payload.userId)
        system_instruction = f"""{PSYCHEAL_SYSTEM_INSTRUCTION} 

Additional Voice Rules:
- You are speaking aloud as Gemini/ElevenLabs {payload.voiceName} with a {payload.voiceTone} tone.
- Keep responses extremely short (1-2 sentences maximum), warm, conversational, and direct.
- DO NOT use any markdown, bullet points, asterisks, or formatting. Keep it strictly raw spoken text.
- Use words that sound extremely comforting, soothing, and easy to understand when spoken aloud.
{memory_context}"""

        messages_list = [{"sender": "user", "text": payload.transcript}]
        reply_text = await ai_service.generate(messages_list, system_instruction)
        
        # Auto extract memory traits from voice input
        await memory_service.auto_extract_and_store(db, payload.userId, payload.transcript, reply_text)

        return {"text": reply_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate voice reply: {str(e)}")

@app.post("/api/tts")
async def tts_handler(payload: TTSRequest):
    if not payload.text:
        raise HTTPException(status_code=400, detail="Text is required")

    # 1. ElevenLabs is our primary high-fidelity voice synthesis engine
    if voice_service.is_eleven_labs_configured():
        try:
            audio_bytes = await voice_service.synthesize_speech(payload.text, payload.voiceName)
            import base64
            audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
            return {"audio": audio_base64, "isOfficial": True, "provider": "elevenlabs"}
        except Exception as e:
            # log warning & trigger fallback
            print(f"ElevenLabs synthesis failed: {e}. Triggering fallback...")

    # 2. Return fallback response
    return {
        "error": "ElevenLabs is not configured or failed. Synthesize via local Web Speech Synthesis in browser.",
        "isOfficial": False,
        "provider": "browser"
    }

# --- MEMORY OPERATIONS ---

@app.get("/api/memories")
async def list_memories(userId: str = "bilaallive2021", db: Session = Depends(get_db)):
    try:
        m_list = await memory_service.get_all_memories(db, userId)
        formatted_list = []
        for m in m_list:
            formatted_list.append({
                "id": m.id,
                "userId": m.user_id,
                "memoryText": m.memory_text,
                "category": m.category,
                "strength": m.strength,
                "createdAt": m.created_at.isoformat() if m.created_at else None
            })
        return {"success": True, "memories": formatted_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/memories")
async def create_memory(payload: MemoryCreate, db: Session = Depends(get_db)):
    try:
        m = await memory_service.create_manual_memory(db, payload.userId, payload.text, payload.category)
        return {
            "success": True, 
            "memory": {
                "id": m.id,
                "userId": m.user_id,
                "memoryText": m.memory_text,
                "category": m.category,
                "strength": m.strength,
                "createdAt": m.created_at.isoformat() if m.created_at else None
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/memories/{memory_id}")
async def delete_memory(memory_id: str, userId: str = "bilaallive2021", db: Session = Depends(get_db)):
    try:
        success = await memory_service.delete_memory(db, userId, memory_id)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
