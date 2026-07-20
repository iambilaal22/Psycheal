import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Type } from '@google/genai';
import { aiService } from './server/services/ai';
import { voiceService } from './server/services/voice';
import { databaseService } from './server/services/database';
import { memoryService } from './server/services/memory';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Empathetic System Guidelines for PsycHeal
const PSYCHEAL_SYSTEM_INSTRUCTION = `You are Psycheal, an empathetic AI mental wellness companion designed to support users through thoughtful conversation, emotional reflection, and evidence-informed guidance.

Your mission is not to simply comfort users with generic phrases. Your mission is to understand each person’s unique situation, help them think clearly, reduce emotional distress, encourage healthy coping strategies, and support long-term personal growth.

Core Personality
	•	Calm
	•	Compassionate
	•	Warm
	•	Respectful
	•	Emotionally intelligent
	•	Non-judgmental
	•	Patient
	•	Honest
	•	Professional
	•	Hopeful

Never sound robotic.

Never repeatedly say:
	•	“Take a deep breath.”
	•	“Calm down.”
	•	“Everything will be okay.”

unless they genuinely fit the situation.

Every response should feel unique.

⸻

Conversation Goals

Before giving advice:
	1.	Understand the user’s situation.
	2.	Identify their emotions.
	3.	Identify the main problem.
	4.	Explore possible causes.
	5.	Understand how long they have been experiencing it.
	6.	Understand how severe it is.
	7.	Understand what they have already tried.
	8.	Then provide guidance.

Never rush to advice.

⸻

Counseling Style

Use evidence-informed approaches where appropriate, including:
	•	Active listening
	•	Validation of emotions
	•	Reflective questioning
	•	Cognitive Behavioral Therapy (CBT)-inspired techniques
	•	Acceptance and Commitment Therapy (ACT)-inspired techniques
	•	Behavioral activation
	•	Stress management
	•	Problem-solving
	•	Goal setting
	•	Habit building
	•	Motivational interviewing principles
	•	Emotional regulation strategies
	•	Mindfulness exercises when appropriate

Do not mention therapy names unless the user asks.

⸻

Personalization

Remember important long-term user information, including:
	•	goals
	•	habits
	•	preferred coping strategies
	•	hobbies
	•	work
	•	studies
	•	family context
	•	previous conversations
	•	emotional triggers
	•	achievements
	•	recurring struggles

Use these naturally in future conversations.

⸻

Response Structure

Whenever possible:
	1.	Acknowledge the emotion.
	2.	Summarize the situation.
	3.	Ask one or two thoughtful follow-up questions if more context is needed.
	4.	Offer practical guidance.
	5.	Suggest realistic next steps.
	6.	End with encouragement.

Avoid overwhelming the user.

⸻

When Giving Guidance

Instead of:

“Take a deep breath.”

Prefer:

“I can see this situation feels overwhelming because it affects something that’s important to you. Let’s understand what happened first, then we can look at practical ways to handle it.”

⸻

Avoid Generic Responses

Never repeatedly use the same phrases.

Every conversation should feel natural.

Vary wording.

Vary structure.

Vary examples.

⸻

Practical Guidance

Whenever appropriate, help users:
	•	solve problems
	•	improve communication
	•	manage conflict
	•	reduce stress
	•	improve sleep
	•	improve productivity
	•	build confidence
	•	overcome procrastination
	•	improve relationships
	•	manage anxiety
	•	recover from setbacks
	•	develop resilience
	•	set achievable goals

⸻

Emotional Intelligence

Recognize emotions such as:
	•	sadness
	•	grief
	•	loneliness
	•	anxiety
	•	anger
	•	guilt
	•	shame
	•	frustration
	•	burnout
	•	hopelessness
	•	excitement
	•	joy

Adjust your tone accordingly.

⸻

Follow-Up

Do not end conversations abruptly.

Check whether your guidance helped.

Ask meaningful follow-up questions.

Continue supporting the user.

⸻

Crisis Situations

If a user expresses thoughts of self-harm or suicide:
	•	respond calmly and compassionately,
	•	encourage them to seek immediate help from trusted people or local emergency services,
	•	encourage contacting a mental health professional or crisis service appropriate to their location,
	•	remain supportive,
	•	do not shame,
	•	do not minimize,
	•	do not make promises.

⸻

Communication Style

Write naturally.

Avoid sounding scripted.

Avoid repetitive reassurance.

Avoid long lectures.

Avoid excessive disclaimers.

Avoid emojis unless the user prefers them.

Speak like a thoughtful, emotionally intelligent human companion.

⸻

Psycheal Philosophy

Psycheal exists to help people understand themselves better, make healthier decisions, develop resilience, and build long-term emotional well-being through personalized, respectful, and practical conversations.`;

// Helper function to detect if an error is due to an unconfigured key, quota exhaustion, or rate limits
function isAIUnavailableError(error: any): boolean {
  if (!error) return false;
  const errMsg = (error.message || String(error)).toLowerCase();
  return (
    errMsg === "ai_provider_unconfigured" ||
    errMsg === "gemini_api_key_missing" ||
    errMsg.includes("quota") ||
    errMsg.includes("limit") ||
    errMsg.includes("429") ||
    errMsg.includes("exhausted") ||
    errMsg.includes("resource_exhausted") ||
    error.status === 429 ||
    error.statusCode === 429 ||
    error.code === 429
  );
}

import { createClient as createBackendSupabaseClient } from '@supabase/supabase-js';

const sbUrl = process.env.VITE_SUPABASE_URL || '';
const sbAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const isRealBackendSupabaseConfigured = 
  !!sbUrl && 
  !!sbAnonKey && 
  sbUrl !== 'YOUR_SUPABASE_URL' && 
  sbAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

const backendSupabase = isRealBackendSupabaseConfigured 
  ? createBackendSupabaseClient(sbUrl, sbAnonKey) 
  : null;

async function getUserIdFromRequest(req: any): Promise<string> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return req.body?.userId || req.query?.userId || 'bilaallive2021';
  }
  const token = authHeader.split(' ')[1];

  if (token.startsWith('sb-token-')) {
    return token.replace('sb-token-', '') || 'bilaallive2021';
  }

  if (backendSupabase) {
    try {
      const { data: { user }, error } = await backendSupabase.auth.getUser(token);
      if (!error && user) {
        return user.id;
      }
    } catch (err) {
      console.error("Backend Supabase JWT validation error:", err);
    }
  }

  return 'bilaallive2021';
}

// API routes go here FIRST
app.get('/api/check-key', (req, res) => {
  res.json({ 
    configured: !!process.env.GEMINI_API_KEY,
    elevenLabsConfigured: voiceService.isElevenLabsConfigured(),
    aiProvider: process.env.AI_PROVIDER || 'gemini',
    databaseType: databaseService.isUsingPostgres() ? 'PostgreSQL' : 'JSON-File DB'
  });
});

// Endpoint 1: Conversational Chat / Companion with Memory Integration
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  const userId = await getUserIdFromRequest(req);
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid messages array" });
  }

  try {
    // 1. Retrieve the user's long-term personalized memories to form context
    const memoryContext = await memoryService.compileContextForPrompt(userId);
    const fullSystemInstruction = `${PSYCHEAL_SYSTEM_INSTRUCTION}${memoryContext}`;

    // 2. Generate content via our pluggable AI Service
    const replyText = await aiService.generate(messages, fullSystemInstruction);

    // 3. Asynchronously extract and store any new memories from the user's input
    const lastUserMessage = messages[messages.length - 1]?.text || '';
    if (lastUserMessage) {
      await memoryService.autoExtractAndStore(userId, lastUserMessage, replyText);
    }

    res.json({ text: replyText });
  } catch (error: any) {
    console.error("Chat API error:", error);
    if (isAIUnavailableError(error)) {
      // Friendly high-fidelity local mock response
      const lastMsg = messages[messages.length - 1]?.text?.toLowerCase() || '';
      let reply = "I hear you, and I am completely here for you. [PsycHeal is running in local backup mode. Configure your GEMINI_API_KEY in Secrets to unlock full cognitive companion reasoning, or wait for your daily free-tier quota to reset!]";
      if (lastMsg.includes("stress") || lastMsg.includes("anxious") || lastMsg.includes("anxiety")) {
        reply = "It sounds like you're carrying a lot of weight right now. Let's take a slow breath together. Inhale deeply... and release. What's one small thing we can focus on together? [Configure your GEMINI_API_KEY or wait for your daily free-tier quota to reset to unlock full guidance]";
      } else if (lastMsg.includes("sad") || lastMsg.includes("lonely") || lastMsg.includes("depressed")) {
        reply = "I'm so sorry you're feeling this heavy cloud. You don't have to walk through this alone. I'm right here with you. What do you feel contributed to this today? [Configure your GEMINI_API_KEY or wait for your daily free-tier quota to reset to unlock full guidance]";
      }
      return res.json({ text: reply });
    }
    res.status(500).json({ error: "Failed to generate response", details: error.message });
  }
});

// Endpoint 2: Voice Call Conversational Processor with Memory Integration
app.post('/api/voice-reply', async (req, res) => {
  const { transcript, voiceName, voiceTone } = req.body;
  const userId = await getUserIdFromRequest(req);
  
  try {
    const memoryContext = await memoryService.compileContextForPrompt(userId);
    const systemInstruction = `${PSYCHEAL_SYSTEM_INSTRUCTION} \n\nAdditional Voice Rules:
- You are speaking aloud as Gemini/ElevenLabs ${voiceName || 'Rachel'} with a ${voiceTone || 'soothing, calm'} tone.
- Keep responses extremely short (1-2 sentences maximum), warm, conversational, and direct.
- DO NOT use any markdown, bullet points, asterisks, or formatting. Keep it strictly raw spoken text.
- Use words that sound extremely comforting, soothing, and easy to understand when spoken aloud.
${memoryContext}`;

    // Convert transcript input to a standard format that aiService.generate expects
    let messagesToGenerate: any[] = [];
    let userTextForMemory = '';

    if (Array.isArray(transcript)) {
      // It is a conversational history array from VoiceCall.tsx
      messagesToGenerate = transcript.map(item => {
        const textValue = typeof item.parts?.[0]?.text === 'string' 
          ? item.parts[0].text 
          : (typeof item.text === 'string' ? item.text : '');
        return {
          sender: (item.role === 'user' || item.sender === 'user') ? 'user' : 'assistant',
          text: textValue
        };
      });

      // Find the last user message for memory extraction
      for (let i = transcript.length - 1; i >= 0; i--) {
        const item = transcript[i];
        const isUser = item.role === 'user' || item.sender === 'user';
        const textVal = typeof item.parts?.[0]?.text === 'string' 
          ? item.parts[0].text 
          : (typeof item.text === 'string' ? item.text : '');
        if (isUser && textVal) {
          userTextForMemory = textVal;
          break;
        }
      }
    } else if (typeof transcript === 'string') {
      // It is a simple message string from Companion.tsx
      messagesToGenerate = [{ sender: 'user', text: transcript }];
      userTextForMemory = transcript;
    } else {
      // Fallback
      const textVal = String(transcript || '');
      messagesToGenerate = [{ sender: 'user', text: textVal }];
      userTextForMemory = textVal;
    }

    const replyText = await aiService.generate(messagesToGenerate, systemInstruction);
    
    // Auto extract memory traits from voice input
    if (userTextForMemory) {
      await memoryService.autoExtractAndStore(userId, userTextForMemory, replyText);
    }

    res.json({ text: replyText });
  } catch (error: any) {
    console.error("Voice Reply API error:", error);
    if (isAIUnavailableError(error)) {
      return res.json({ text: "I am listening closely. Let's take a peaceful, slow breath together. You are safe here." });
    }
    res.status(500).json({ error: "Failed to generate voice reply" });
  }
});

// Helper to convert raw 16-bit PCM (24kHz) to standard playable WAV format
function pcmToWav(pcmBuffer: Buffer, sampleRate: number = 24000): Buffer {
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size
  header.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  header.writeUInt16LE(1, 22); // NumChannels (1 for mono)
  header.writeUInt32LE(sampleRate, 24); // SampleRate
  header.writeUInt32LE(sampleRate * 1 * 2, 28); // ByteRate (sampleRate * numChannels * bitsPerSample/8)
  header.writeUInt16LE(2, 32); // BlockAlign (numChannels * bitsPerSample/8)
  header.writeUInt16LE(16, 34); // BitsPerSample (16)
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// Endpoint: High-Fidelity Text-to-Speech (TTS) using ElevenLabs with Gemini Fallback
app.post('/api/tts', async (req, res) => {
  const { text, voiceName } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  // 1. If ElevenLabs is configured, use it as the primary engine
  if (voiceService.isElevenLabsConfigured()) {
    try {
      console.log("Voice Provider: ElevenLabs");
      const audioBuffer = await voiceService.synthesizeSpeech(text, voiceName);
      const audioBase64 = audioBuffer.toString('base64');
      return res.json({ audio: audioBase64, isOfficial: true, provider: 'elevenlabs' });
    } catch (elevenErr: any) {
      console.log("ElevenLabs TTS unavailable, falling back to Gemini:", elevenErr.message);
    }
  }

  // 2. Fallback to Gemini High-Fidelity Prebuilt Voice Synthesis
  try {
    console.log("Voice Provider: Gemini Fallback");
    let selectedVoice = 'Kore'; 
    const normalized = (voiceName || '').toLowerCase();
    
    if (
      normalized.includes('nova') || 
      normalized.includes('gemma') || 
      normalized.includes('kore') ||
      normalized.includes('calm') ||
      normalized.includes('joy') ||
      normalized.includes('signature') ||
      normalized.includes('ursa') || 
      normalized.includes('vega') || 
      normalized.includes('lyra') || 
      normalized.includes('aoede') ||
      normalized.includes('hope') ||
      normalized.includes('warm') ||
      normalized.includes('focus')
    ) {
      selectedVoice = 'Kore';
    } else if (
      normalized.includes('capella') || 
      normalized.includes('charon') ||
      normalized.includes('serenity') ||
      normalized.includes('peace') ||
      normalized.includes('pinnacle')
    ) {
      selectedVoice = 'Charon';
    } else if (
      normalized.includes('orbit') || 
      normalized.includes('puck') ||
      normalized.includes('harmony') ||
      normalized.includes('orion') ||
      normalized.includes('energy')
    ) {
      selectedVoice = 'Puck';
    } else if (
      normalized.includes('eclipse') || 
      normalized.includes('fenrir') ||
      normalized.includes('gentle')
    ) {
      selectedVoice = 'Fenrir';
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY_MISSING");
    }

    const { GoogleGenAI } = await import('@google/genai');
    const aiClient = new GoogleGenAI({ apiKey: key });

    const response = await aiClient.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: text,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    let base64Audio = '';
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        base64Audio = part.inlineData.data;
        break;
      }
    }

    if (!base64Audio) {
      throw new Error("No audio returned from Gemini fallback TTS");
    }

    const pcmBuffer = Buffer.from(base64Audio, 'base64');
    
    // Check if the returned buffer already contains a valid WAV header (starts with 'RIFF')
    // or an MP3 header (starts with 'ID3' or 0xFF syncword). If so, do not double-wrap it!
    const isWav = pcmBuffer.length > 4 && pcmBuffer.slice(0, 4).toString('ascii') === 'RIFF';
    const isMp3 = pcmBuffer.length > 3 && (pcmBuffer.slice(0, 3).toString('ascii') === 'ID3' || (pcmBuffer[0] === 0xFF && (pcmBuffer[1] & 0xE0) === 0xE0));
    
    let wavBuffer = pcmBuffer;
    if (isWav || isMp3) {
      console.log(`Gemini fallback audio is already encoded (${isWav ? 'WAV' : 'MP3'}). Sending as-is.`);
    } else {
      console.log("Gemini fallback audio is raw PCM. Wrapping with WAV header.");
      wavBuffer = pcmToWav(pcmBuffer, 24000);
    }

    const wavBase64 = wavBuffer.toString('base64');

    res.json({ audio: wavBase64, isOfficial: true, provider: 'gemini' });
  } catch (error: any) {
    console.error("Gemini TTS API fallback error:", error);
    res.json({ error: error.message, isOfficial: false });
  }
});

// Endpoint 3: Journal AI analysis and reflection
app.post('/api/journal-analysis', async (req, res) => {
  const { title, content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Journal content is required" });
  }

  const prompt = `Analyze this journal entry and provide a comforting, psychological feedback message.
Title: ${title || "Untitled Entry"}
Content: ${content}

Give me an insightful, grounding reflection that highlights any progress, underlying emotional cues, and recommends a gentle cognitive reframing or mindfulness action. Speak directly to the author as a supportive, empathetic wellness coach.`;

  try {
    const responseText = await aiService.generate([{ sender: 'user', text: prompt }], PSYCHEAL_SYSTEM_INSTRUCTION);
    res.json({ feedback: responseText });
  } catch (error: any) {
    console.error("Journal Analysis API error:", error);
    if (isAIUnavailableError(error)) {
      return res.json({ 
        feedback: "Thank you for sharing your thoughts in your journal. Writing things down is a powerful step in processing emotions. [To get customized deep cognitive reflections, configure your GEMINI_API_KEY in Secrets or wait for your daily free-tier quota to reset!]" 
      });
    }
    res.status(500).json({ error: "Failed to analyze journal" });
  }
});

// Endpoint 4: Customized CBT / Mindfulness Wellness Plan Generator
app.post('/api/generate-plan', async (req, res) => {
  const { category, currentFeelings } = req.body;
  if (!category || !currentFeelings) {
    return res.status(400).json({ error: "Category and currentFeelings are required" });
  }

  const prompt = `Generate a highly personalized 5-day cognitive/mindfulness wellness plan for a user feeling: "${currentFeelings}".
Category selected is: "${category}".

The response must contain:
1. Title of the plan.
2. Short therapeutic description explaining why this plan helps their feelings.
3. An array of exactly 5 daily task objects, each containing an 'id' (day-1, day-2, etc.), a concise 'title' for that day's CBT or mindfulness activity, and 'completed' set to false.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "Title of the personalized plan" },
      description: { type: Type.STRING, description: "Compassionate explanation of the plan's benefits" },
      tasks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING, description: "Daily therapeutic, actionable activity description (max 20 words)" },
            completed: { type: Type.BOOLEAN }
          },
          required: ["id", "title", "completed"]
        }
      }
    },
    required: ["title", "description", "tasks"]
  };

  try {
    const planData = await aiService.generateStructured([{ sender: 'user', text: prompt }], PSYCHEAL_SYSTEM_INSTRUCTION, schema);
    res.json(planData);
  } catch (error: any) {
    console.error("Plan Generator API error:", error);
    
    // Reliable high-fidelity fallback plans based on category
    let title = `${category} Grounding Journey`;
    let description = "A therapeutic series of daily habits crafted to help you step away from stress and find inner grounding and peace.";
    let tasks = [
      { id: "day-1", title: "CBT Reframing: Write down 3 anxious thoughts and challenge their realistic basis.", completed: false },
      { id: "day-2", title: "Deep Breathing: Complete 5 minutes of box breathing (4s inhale, 4s hold, 4s exhale, 4s hold).", completed: false },
      { id: "day-3", title: "Gratitude Reflection: Note 3 simple things that brought you comfort or ease today.", completed: false },
      { id: "day-4", title: "Mindful Sensing: Spend 3 minutes engaging the 5-4-3-2-1 sensory technique in your room.", completed: false },
      { id: "day-5", title: "Values Check-in: Write down one core personal value and align one of today's actions with it.", completed: false }
    ];

    if (category === "Mindfulness") {
      title = "5-Day Calm Mindfulness Sanctuary";
      description = "Slow down your sensory experience to reset a racing mind and establish serene anchors.";
      tasks = [
        { id: "day-1", title: "Mindful Coffee/Water: Savor every sip, noticing temperature, aroma, and taste.", completed: false },
        { id: "day-2", title: "Body Scan Meditation: Focus awareness from your toes up to your shoulders, releasing tension.", completed: false },
        { id: "day-3", title: "Ambient Walk: Walk slowly for 10 minutes, observing shadows, wind, and sounds.", completed: false },
        { id: "day-4", title: "Gratitude Anchor: Send a quick, warm, supportive appreciation message to a loved one.", completed: false },
        { id: "day-5", title: "Peaceful Reflection: Sit in complete silence for 5 minutes, allowing thoughts to float like clouds.", completed: false }
      ];
    } else if (category === "Anxiety Grounding") {
      title = "5-Day Somatic Grounding & Anxiety Release";
      description = "Bring racing thoughts back to physical reality through physical grounding and somatic release.";
      tasks = [
        { id: "day-1", title: "Physical Anchoring: Push your feet firmly into the floor, feeling the support of the earth.", completed: false },
        { id: "day-2", title: "Progressive Muscle Relaxation: Squeeze hands for 5 seconds, then fully release.", completed: false },
        { id: "day-3", title: "Cold Water Reset: Splash cold water on your face or hold an ice cube to reset your nervous system.", completed: false },
        { id: "day-4", title: "Vocal Grounding: Hum a low, resonant tone for 2 minutes to stimulate the vagus nerve.", completed: false },
        { id: "day-5", title: "Gentle Stretching: Spend 5 minutes stretching your chest, neck, and hips to release physical stress.", completed: false }
      ];
    }

    res.json({
      title,
      description: `${description} [Note: Utilizing pre-compiled clinical plan templates. Add your GEMINI_API_KEY in Secrets to generate dynamically personalized AI journeys!]`,
      tasks
    });
  }
});

// --- NEW ENDPOINTS: Personal Memory Management ---
app.get('/api/memories', async (req, res) => {
  const userId = await getUserIdFromRequest(req);
  try {
    const list = await memoryService.getAllMemoriesForUser(userId);
    res.json({ success: true, memories: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/memories', async (req, res) => {
  const { text, category } = req.body;
  const userId = await getUserIdFromRequest(req);
  if (!text || !category) {
    return res.status(400).json({ success: false, error: "Text and category are required" });
  }
  try {
    const newMemory = await memoryService.createManualMemory(userId, text, category);
    res.json({ success: true, memory: newMemory });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/memories/:id', async (req, res) => {
  const userId = await getUserIdFromRequest(req);
  const memoryId = req.params.id;
  try {
    const success = await memoryService.deleteMemory(userId, memoryId);
    res.json({ success });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Configure Vite or Serve static files
const initServer = async () => {
  const isProd = process.env.NODE_ENV === 'production';
  
  if (!isProd) {
    // Development Mode - Use Vite middleware
    console.log("Starting PsycHeal Server in DEVELOPMENT mode...");
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode - Serve compiled static files
    console.log("Starting PsycHeal Server in PRODUCTION mode...");
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`PsycHeal Full-Stack Server running on port ${PORT}`);
  });
};

initServer().catch(err => {
  console.error("Failed to start PsycHeal server:", err);
});
