import abc
import json
import httpx
from google import genai
from google.genai import types
from app.config import settings

class AIProvider(abc.ABC):
    @abc.abstractmethod
    async def generate_text(self, messages: list, system_instruction: str = None) -> str:
        pass

    @abc.abstractmethod
    async def generate_structured(self, messages: list, system_instruction: str, schema: dict) -> dict:
        pass

class GeminiProvider(AIProvider):
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured")
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    async def generate_text(self, messages: list, system_instruction: str = None) -> str:
        # Format messages for google-genai SDK
        contents = []
        for msg in messages:
            contents.append(
                types.Content(
                    role="user" if msg["sender"] == "user" else "model",
                    parts=[types.Part.from_text(text=msg["text"])]
                )
            )

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7
        )

        response = self.client.models.generate_content(
            model="gemini-3.5-flash",
            contents=contents,
            config=config
        )
        return response.text or ""

    async def generate_structured(self, messages: list, system_instruction: str, schema: dict) -> dict:
        contents = []
        for msg in messages:
            contents.append(
                types.Content(
                    role="user" if msg["sender"] == "user" else "model",
                    parts=[types.Part.from_text(text=msg["text"])]
                )
            )

        # Convert simple JSON schema description to Schema types if required,
        # or rely on direct Schema definitions in Python.
        # For full FastAPI integration, we can also pass structure or generate via prebuilt templates.
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            temperature=0.7
        )

        response = self.client.models.generate_content(
            model="gemini-3.5-flash",
            contents=contents,
            config=config
        )
        return json.loads(response.text or "{}")

class OpenWeightProvider(AIProvider):
    def __init__(self):
        self.api_url = settings.OPEN_WEIGHT_MODEL_API_URL or "https://api.openai.com/v1"
        self.api_key = settings.OPEN_WEIGHT_MODEL_API_KEY or ""
        self.model_name = settings.OPEN_WEIGHT_MODEL_NAME or "gemma2-9b-it"

    async def generate_text(self, messages: list, system_instruction: str = None) -> str:
        formatted_messages = []
        if system_instruction:
            formatted_messages.append({"role": "system", "content": system_instruction})
        
        for msg in messages:
            formatted_messages.append({
                "role": "user" if msg["sender"] == "user" else "assistant",
                "content": msg["text"]
            })

        async with httpx.AsyncClient() as client:
            headers = {"Content-Type": "application/json"}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"

            response = await client.post(
                f"{self.api_url}/chat/completions",
                headers=headers,
                json={
                    "model": self.model_name,
                    "messages": formatted_messages,
                    "temperature": 0.7
                },
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"] or ""

    async def generate_structured(self, messages: list, system_instruction: str, schema: dict) -> dict:
        formatted_messages = [
            {"role": "system", "content": f"{system_instruction}\n\nConform exactly to JSON Schema: {json.dumps(schema)}"}
        ]
        for msg in messages:
            formatted_messages.append({
                "role": "user" if msg["sender"] == "user" else "assistant",
                "content": msg["text"]
            })

        async with httpx.AsyncClient() as client:
            headers = {"Content-Type": "application/json"}
            if self.api_key:
                headers["Authorization"] = f"Bearer {self.api_key}"

            response = await client.post(
                f"{self.api_url}/chat/completions",
                headers=headers,
                json={
                    "model": self.model_name,
                    "messages": formatted_messages,
                    "temperature": 0.7,
                    "response_format": {"type": "json_object"}
                },
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            raw_text = data["choices"][0]["message"]["content"] or "{}"
            return json.loads(raw_text)

class AIService:
    def __init__(self):
        self._provider = None
        self._provider_type = settings.AI_PROVIDER.lower()

    def get_provider(self) -> AIProvider:
        if not self._provider:
            if self._provider_type in ["open-weight", "openweight", "self-hosted"]:
                self._provider = OpenWeightProvider()
            else:
                self._provider = GeminiProvider()
        return self._provider

    async def generate(self, messages: list, system_instruction: str = None) -> str:
        return await self.get_provider().generate_text(messages, system_instruction)

    async def generate_structured(self, messages: list, system_instruction: str, schema: dict) -> dict:
        return await self.get_provider().generate_structured(messages, system_instruction, schema)

ai_service = AIService()
