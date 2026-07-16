# PsycHeal High-Fidelity Modular Backend (FastAPI)

Welcome to the production-ready Python FastAPI architecture for **PsycHeal**. 

This backend is designed with high modularity, separating API routers, pluggable AI providers, continuous memory extractors, ElevenLabs speech synthesizers, and database clients.

---

## 🏗️ Architecture Stack Overview

1. **Voice synthesis**: Primary engine powered by ElevenLabs for natural, empathetic, and ultra-low-latency voice responses.
2. **LLM Cognitive Layer**: Google Gemini with a provider abstraction. Allows instant toggling to open-weight self-hosted models (such as Llama-3, Gemma-2, or Qwen-2) via OpenAI-compatible endpoints simply by changing environment variables.
3. **Database Layer**: Robust PostgreSQL backend mapped through SQLAlchemy (ORM) models. Defaults to automatic thread-safe SQLite if credentials aren't provided.
4. **Long-Term Memory Engine**: Auto-extracts preferences, therapeutic goals, and daily routines during active exchanges, loading them as dynamic system context on subsequent check-ins.

---

## 🛠️ Folder Hierarchy

```text
backend/
├── app/
│   ├── main.py          # FastAPI application entry & API routers
│   ├── config.py        # Secure environment loading & validation
│   ├── db/
│   │   ├── session.py   # Connection pools & session handling
│   │   └── models.py    # SQLAlchemy tables (profiles, goals, memories)
│   └── services/
│       ├── ai_service.py     # Provider abstraction (Gemini vs Open-Weight)
│       ├── voice_service.py  # ElevenLabs speech synthesizer
│       └── memory_service.py # Continuous cognitive memory compiler
├── requirements.txt     # Python production-locked packages
└── README.md            # Execution & deployment guide (This File)
```

---

## 🚀 Quick Start Instructions

### 1. Configure Environment Variables
Create a `.env` file in the `backend/` directory or set these in your shell environment:

```env
# Server Port (Optional, default is 8000)
PORT=8000

# 1. Models & LLM configuration
GEMINI_API_KEY=your_google_gemini_api_key_here
AI_PROVIDER=gemini  # Switch to 'open-weight' to use self-hosted models

# If using self-hosted open-weight models (Llama, Gemma, Qwen):
OPEN_WEIGHT_MODEL_API_URL=https://your-custom-endpoint/v1
OPEN_WEIGHT_MODEL_API_KEY=your_custom_model_token
OPEN_WEIGHT_MODEL_NAME=gemma2-9b-it

# 2. Voice (ElevenLabs Settings)
ELEVENLABS_API_KEY=your_elevenlabs_token_here

# 3. Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/dbname
```

### 2. Set Up Virtual Environment & Install Packages
Run the following commands inside the `backend/` directory:

```bash
# Create a python virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install all packages
pip install -r requirements.txt
```

### 3. Launch Development Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
FastAPI will now boot and listen on http://localhost:8000.
Interactive swagger documentation will be accessible at http://localhost:8000/docs.

---

## 🔐 Pluggable AI Service Customization
Our AI Provider interface ensures zero logic changes are required when changing LLM layers:
- **GeminiProvider**: Fully optimized for `gemini-3.5-flash` processing.
- **OpenWeightProvider**: Plugs into self-hosted engines. Simply swap the endpoint URL and enjoy the same cognitive reasoning.
