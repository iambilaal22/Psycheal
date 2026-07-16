import os
from typing import Optional
from pydantic import model_validator
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "PsycHeal Modular Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Secrets & API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "") # PostgreSQL URL
    
    # LLM Settings
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini") # "gemini" or "open_weight_model"
    OPEN_WEIGHT_MODEL_API_URL: Optional[str] = os.getenv("OPEN_WEIGHT_MODEL_API_URL", None)
    OPEN_WEIGHT_MODEL_API_KEY: Optional[str] = os.getenv("OPEN_WEIGHT_MODEL_API_KEY", None)
    OPEN_WEIGHT_MODEL_NAME: Optional[str] = os.getenv("OPEN_WEIGHT_MODEL_NAME", None)

    @model_validator(mode='after')
    def validate_open_weight_variables(self) -> 'Settings':
        provider = (self.AI_PROVIDER or "").lower()
        if provider == "open_weight_model":
            if not self.OPEN_WEIGHT_MODEL_API_URL:
                raise ValueError("OPEN_WEIGHT_MODEL_API_URL is required when AI_PROVIDER is set to open_weight_model")
            if not self.OPEN_WEIGHT_MODEL_NAME:
                raise ValueError("OPEN_WEIGHT_MODEL_NAME is required when AI_PROVIDER is set to open_weight_model")
        return self

    class Config:
        case_sensitive = True

settings = Settings()
