from sqlalchemy import Column, String, Integer, Boolean, DateTime, Float, ARRAY, JSON
from sqlalchemy.sql import func
from app.db.session import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(String, primary_key=True, index=True)
    nickname = Column(String, nullable=False)
    daily_goal_minutes = Column(Integer, default=15)
    checkin_streak = Column(Integer, default=0)
    premium = Column(Boolean, default=False)

class PersonalizedMemory(Base):
    __tablename__ = "personalized_memories"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    memory_text = Column(String, nullable=False)
    category = Column(String, default="preference")  # preference, goal, habit, personality, summary
    strength = Column(Integer, default=3)             # 1-5 strength
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class MoodRecord(Base):
    __tablename__ = "mood_history"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    rating = Column(Integer, nullable=False)
    note = Column(String, nullable=True)
    stressors = Column(JSON, nullable=True)     # JSON list of stressors
    techniques = Column(JSON, nullable=True)    # JSON list of coping skills applied
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class WellnessGoal(Base):
    __tablename__ = "goals_and_habits"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    type = Column(String, default="habit")  # habit, cbt, mindfulness, somatic
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
