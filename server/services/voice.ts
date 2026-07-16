export interface VoiceConfig {
  voiceId?: string;
  stability?: number;
  similarity_boost?: number;
  style?: number;
  useElevenLabs?: boolean;
}

export class VoiceService {
  // Pre-configured ElevenLabs high-quality empathetic voices:
  // "Rachel" (Female, conversational, gentle): 21m00Tcm4TlvDq8ikWAM
  // "Adam" (Male, deep, comforting, warm): pNInz6obpgq5mWbJ7mX7
  // "Bella" (Female, soft, therapeutic): EXAVITQu4vr4xnSDgMaL
  public static ELEVENLABS_VOICES = {
    rachel: "21m00Tcm4TlvDq8ikWAM",
    adam: "pNInz6obpgq5mWbJ7mX7",
    bella: "AZnzlk1XvdvUeBnXmlld",
  };

  private static cachedVoices: Array<{ voice_id: string, name: string, category: string }> | null = null;

  async fetchVoices(): Promise<Array<{ voice_id: string, name: string, category: string }>> {
    if (VoiceService.cachedVoices) {
      return VoiceService.cachedVoices;
    }
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return [];

    try {
      const response = await fetch("https://api.elevenlabs.io/v1/voices", {
        headers: { "xi-api-key": apiKey }
      });
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.voices)) {
          VoiceService.cachedVoices = data.voices.map((v: any) => ({
            voice_id: v.voice_id,
            name: v.name,
            category: v.category
          }));
          return VoiceService.cachedVoices || [];
        }
      }
    } catch (e) {
      console.log("ElevenLabs list voices fetch notice (non-fatal):", e);
    }
    return [];
  }

  /**
   * Synthesizes text into high-fidelity audio speech using ElevenLabs API.
   * Returns a base64 encoded audio stream string (MPEG format).
   */
  async synthesizeSpeech(text: string, voiceName: string = 'rachel'): Promise<Buffer> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error("ELEVENLABS_API_KEY_MISSING");
    }

    // Select the designated voice ID based on preferences (fully mapped to Psycheal branded names)
    const normalized = voiceName.toLowerCase();
    
    // Determine the ideal voice type matching the user's requested style
    let targetType: 'rachel' | 'adam' | 'bella' = 'rachel';
    if (
      normalized.includes('adam') || 
      normalized.includes('male') || 
      normalized.includes('orbit') || 
      normalized.includes('harmony') || 
      normalized.includes('capella') || 
      normalized.includes('serenity') || 
      normalized.includes('eclipse') || 
      normalized.includes('gentle') || 
      normalized.includes('orion') || 
      normalized.includes('energy') || 
      normalized.includes('pinnacle') || 
      normalized.includes('peace')
    ) {
      targetType = 'adam';
    } else if (
      normalized.includes('bella') || 
      normalized.includes('soft') || 
      normalized.includes('soothing') || 
      normalized.includes('nova') || 
      normalized.includes('calm') ||
      normalized.includes('domi') ||
      normalized.includes('signature') ||
      normalized.includes('vega') ||
      normalized.includes('warm') ||
      normalized.includes('ursa') ||
      normalized.includes('hope') ||
      normalized.includes('lyra') ||
      normalized.includes('focus') ||
      normalized.includes('gemma') ||
      normalized.includes('joy')
    ) {
      targetType = 'bella';
    }

    let voiceId = VoiceService.ELEVENLABS_VOICES[targetType];

    // Fetch account's actual allowed voices to avoid 402 library restrictions for free accounts
    try {
      const allowedVoices = await this.fetchVoices();
      if (allowedVoices.length > 0) {
        // If our preferred voice is explicitly authorized/available in their list, use it
        const hasPreferred = allowedVoices.some(v => v.voice_id === voiceId);
        if (!hasPreferred) {
          // Find a voice matching the gender or target name
          const nameMatch = allowedVoices.find(v => 
            v.name.toLowerCase().includes(targetType === 'bella' ? 'domi' : targetType) ||
            v.name.toLowerCase().includes(targetType)
          );
          if (nameMatch) {
            voiceId = nameMatch.voice_id;
          } else {
            // Find any prebuilt or default premade voice which doesn't trigger library limitations
            const premade = allowedVoices.find(v => v.category === 'premade');
            if (premade) {
              voiceId = premade.voice_id;
            } else {
              // fallback to the first active/allowed voice on their account
              voiceId = allowedVoices[0].voice_id;
            }
          }
        }
      }
    } catch (voiceFetchErr) {
      console.log("Using default ElevenLabs voice fallback:", voiceFetchErr);
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    
    const requestBody = {
      text,
      model_id: "eleven_multilingual_v2", // high-fidelity multilingual model, fully available on the free tier
      voice_settings: {
        stability: 0.75,         // Higher stability ensures warm, consistent therapeutic tone
        similarity_boost: 0.85,  // High similarity boost retains original natural speech qualities
        style: 0.15,             // Soft stylistic deviation to sound conversational and organic
        use_speaker_boost: true
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'accept': 'audio/mpeg'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(`ElevenLabs returned HTTP ${response.status}: ${errorMsg}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.log("ElevenLabs TTS status (transitioning to backup provider):", err.message || err);
      throw err;
    }
  }

  isElevenLabsConfigured(): boolean {
    return !!process.env.ELEVENLABS_API_KEY;
  }
}

export const voiceService = new VoiceService();
