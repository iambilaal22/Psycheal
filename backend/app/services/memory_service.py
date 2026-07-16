import datetime
from sqlalchemy.orm import Session
from app.db.models import PersonalizedMemory

class MemoryService:
    async def compile_context_for_prompt(self, db: Session, user_id: str) -> str:
        memories = db.query(PersonalizedMemory).filter(PersonalizedMemory.user_id == user_id).all()
        if not memories:
            return ""

        preferences = [f"- {m.memory_text}" for m in memories if m.category == "preference"]
        goals = [f"- {m.memory_text}" for m in memories if m.category == "goal"]
        habits = [f"- {m.memory_text}" for m in memories if m.category == "habit"]
        summaries = [f"- {m.memory_text}" for m in memories if m.category == "summary"]

        context_block = "\n\n=== LONG-TERM PERSONALIZED USER MEMORY (RECALL) ===\n"
        context_block += "These are verified preference traits and background goals recalled from previous conversations. Adapt your tone, advice, and guidance to match them seamlessly:\n"
        
        if preferences:
            context_block += f"\nUser Preferences & Communication Style:\n" + "\n".join(preferences) + "\n"
        if goals:
            context_block += f"\nActive Therapeutic & Well-being Goals:\n" + "\n".join(goals) + "\n"
        if habits:
            context_block += f"\nBehavioral Habits & Coping Mechanisms:\n" + "\n".join(habits) + "\n"
        if summaries:
            context_block += f"\nSummarized insights from recent wellness discussions:\n" + "\n".join(summaries) + "\n"
            
        context_block += "=====================================================\n"
        return context_block

    async def auto_extract_and_store(self, db: Session, user_id: str, user_text: str, ai_text: str):
        text = user_text.lower()
        now = datetime.datetime.utcnow()

        # Simple heuristic triggers
        if "i prefer" in text or "i like" in text or "speak to me" in text or "talk to me" in text:
            extraction = f"User expressed preferences on conversation style: \"{user_text[:80]}\""
            mem = PersonalizedMemory(
                id=f"mem_py_{int(now.timestamp())}_pref",
                user_id=user_id,
                memory_text=extraction,
                category="preference",
                strength=4
            )
            db.add(mem)
            db.commit()

        if "my goal" in text or "working on" in text or "i want to achieve" in text or "trying to" in text:
            extraction = f"User wellness focus: \"{user_text[:80]}\""
            mem = PersonalizedMemory(
                id=f"mem_py_{int(now.timestamp())}_goal",
                user_id=user_id,
                memory_text=extraction,
                category="goal",
                strength=4
            )
            db.add(mem)
            db.commit()

        if "i usually" in text or "every day" in text or "daily" in text or "i practice" in text:
            extraction = f"Observed user routine: \"{user_text[:80]}\""
            mem = PersonalizedMemory(
                id=f"mem_py_{int(now.timestamp())}_habit",
                user_id=user_id,
                memory_text=extraction,
                category="habit",
                strength=3
            )
            db.add(mem)
            db.commit()

    async def create_manual_memory(self, db: Session, user_id: str, text: str, category: str) -> PersonalizedMemory:
        now = datetime.datetime.utcnow()
        mem = PersonalizedMemory(
            id=f"mem_py_{int(now.timestamp())}_man",
            user_id=user_id,
            memory_text=text,
            category=category,
            strength=5
        )
        db.add(mem)
        db.commit()
        db.refresh(mem)
        return mem

    async def get_all_memories(self, db: Session, user_id: str):
        return db.query(PersonalizedMemory).filter(PersonalizedMemory.user_id == user_id).order_by(PersonalizedMemory.created_at.desc()).all()

    async def delete_memory(self, db: Session, user_id: str, memory_id: str) -> bool:
        mem = db.query(PersonalizedMemory).filter(PersonalizedMemory.id == memory_id, PersonalizedMemory.user_id == user_id).first()
        if mem:
            db.delete(mem)
            db.commit()
            return True
        return False

memory_service = MemoryService()
