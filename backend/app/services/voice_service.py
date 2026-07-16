import httpx
from app.config import settings

class VoiceService:
    ELEVENLABS_VOICES = {
        "rachel": "21m00Tcm4TlvDq8ikWAM",
        "adam": "pNInz6obpgq5mWbJ7mX7",
        "bella": "AZnzlk1XvdvUeBnXmlld",
    }

    async def synthesize_speech(self, text: str, voice_name: str = "rachel") -> bytes:
        api_key = settings.ELEVENLABS_API_KEY
        if not api_key:
            raise ValueError("ELEVENLABS_API_KEY is not configured")

        normalized = voice_name.lower()
        voice_id = self.ELEVENLABS_VOICES["rachel"]
        if (
            "adam" in normalized or 
            "male" in normalized or
            "orbit" in normalized or
            "harmony" in normalized or
            "capella" in normalized or
            "serenity" in normalized or
            "eclipse" in normalized or
            "gentle" in normalized or
            "orion" in normalized or
            "energy" in normalized or
            "pinnacle" in normalized or
            "peace" in normalized
        ):
            voice_id = self.ELEVENLABS_VOICES["adam"]
        elif (
            "bella" in normalized or 
            "soft" in normalized or 
            "soothing" in normalized or
            "nova" in normalized or
            "calm" in normalized or
            "signature" in normalized or
            "vega" in normalized or
            "warm" in normalized or
            "ursa" in normalized or
            "hope" in normalized or
            "lyra" in normalized or
            "focus" in normalized or
            "gemma" in normalized or
            "joy" in normalized
        ):
            voice_id = self.ELEVENLABS_VOICES["bella"]

        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        
        headers = {
            "xi-api-key": api_key,
            "Content-Type": "application/json",
            "accept": "audio/mpeg"
        }
        
        payload = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {
                "stability": 0.75,
                "similarity_boost": 0.85,
                "style": 0.15,
                "use_speaker_boost": True
            }
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=30.0)
            response.raise_for_status()
            return response.content

    def is_elevenlabs_configured(self) -> bool:
        return bool(settings.ELEVENLABS_API_KEY)

voice_service = VoiceService()
