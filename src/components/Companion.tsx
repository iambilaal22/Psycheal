import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  PhoneCall, 
  PhoneOff, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Mic, 
  MicOff, 
  Info, 
  Loader2, 
  Sparkles,
  Layers,
  Copy,
  Check,
  Compass,
  Heart,
  Wind,
  Play,
  Pause,
  User,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, ChatSession, ChatMessage } from '../types';

interface CompanionProps {
  userProfile: UserProfile;
  sessions: ChatSession[];
  onAddSession: (session: ChatSession) => void;
  onUpdateSessionMessages: (sessionId: string, messages: ChatMessage[]) => void;
  theme?: 'light' | 'dark';
}

const SUGGESTED_PROMPTS = [
  {
    title: "Overcoming Stress",
    icon: "💼",
    desc: "Feeling overwhelmed with responsibilities",
    prompt: "I am feeling extremely overwhelmed with my work and high-stress responsibilities. Help me break it down.",
    color: "hover:border-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 border-indigo-100 text-indigo-700 dark:text-indigo-300 dark:border-indigo-900/40"
  },
  {
    title: "Ground Racing Thoughts",
    icon: "🧘",
    desc: "Mind is spinning & feeling anxious",
    prompt: "My mind is racing right now and I feel highly anxious. Walk me through a grounding exercise.",
    color: "hover:border-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-100 text-emerald-700 dark:text-emerald-300 dark:border-emerald-900/40"
  },
  {
    title: "Boost Low Mood",
    icon: "🌱",
    desc: "Struggling to find positive motivation",
    prompt: "I'm struggling to find motivation today and feeling down. Help me take one tiny active step.",
    color: "hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border-amber-100 text-amber-700 dark:text-amber-300 dark:border-amber-900/40"
  },
  {
    title: "Resolve Conflict",
    icon: "🤝",
    desc: "Need clarity on interpersonal issues",
    prompt: "I need some guidance on managing a difficult conversation or conflict with someone close to me.",
    color: "hover:border-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border-rose-100 text-rose-700 dark:text-rose-300 dark:border-rose-900/40"
  }
];

export default function Companion({ 
  userProfile, 
  sessions, 
  onAddSession, 
  onUpdateSessionMessages,
  theme = 'dark'
}: CompanionProps) {
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isVoiceMode, setIsVoiceMode] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<"nova" | "capella">("nova");
  const [showApiInfo, setShowApiInfo] = useState<boolean>(true);
  const [elevenLabsConfigured, setElevenLabsConfigured] = useState<boolean>(false);

  // Advanced interactivity & aesthetics states
  const [copiedMsgIdx, setCopiedMsgIdx] = useState<number | null>(null);
  const [playingMsgIdx, setPlayingMsgIdx] = useState<number | null>(null);
  const [isDictatingText, setIsDictatingText] = useState<boolean>(false);
  const [breathStage, setBreathStage] = useState<number>(0);
  const [breathSeconds, setBreathSeconds] = useState<number>(4);

  // Web Speech State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string>('');
  const [transcriptText, setTranscriptText] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const didSeed = useRef<boolean>(false);
  
  // Web Speech API refs
  const recognitionRef = useRef<any>(null);
  const dictationRecRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  // Check ElevenLabs key configuration
  useEffect(() => {
    fetch('/api/check-key')
      .then(res => res.json())
      .then(data => {
        if (data.elevenLabsConfigured) {
          setElevenLabsConfigured(true);
        }
      })
      .catch(err => console.warn("Failed to check ElevenLabs configuration in Companion:", err));
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setIsListening(true);
          setSpeechError('');
        };

        rec.onerror = (e: any) => {
          console.warn("Speech recognition error:", e.error);
          setIsListening(false);
          if (e.error !== "no-speech") {
            setSpeechError(`Microphone notice: ${e.error}`);
          }
        };

        rec.onend = () => {
          setIsListening(false);
        };

        rec.onresult = async (event: any) => {
          const resultText = event.results[0][0].transcript;
          if (resultText && resultText.trim()) {
            setTranscriptText(resultText);
            await handleVoiceInputReceived(resultText);
          }
        };

        recognitionRef.current = rec;
      }
    }

    return () => {
      stopVoiceActivity();
    };
  }, [activeSessionId, selectedVoice]);

  // Somatic Box Breathing guide timer
  useEffect(() => {
    let interval: any = null;
    if (isVoiceMode) {
      interval = setInterval(() => {
        setBreathSeconds(prev => {
          if (prev <= 1) {
            setBreathStage(stage => (stage + 1) % 4);
            return 4; // Reset to 4 seconds
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathStage(0);
      setBreathSeconds(4);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isVoiceMode]);

  // Inline text input dictation SpeechRecognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const dRec = new SpeechRecognition();
        dRec.continuous = false;
        dRec.interimResults = true;
        dRec.lang = 'en-US';

        dRec.onstart = () => {
          setIsDictatingText(true);
        };

        dRec.onerror = (e: any) => {
          console.warn("Dictation speech error:", e);
          setIsDictatingText(false);
        };

        dRec.onend = () => {
          setIsDictatingText(false);
        };

        dRec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
        };

        dictationRecRef.current = dRec;
      }
    }
  }, []);

  const toggleDictation = () => {
    if (!dictationRecRef.current) return;
    if (isDictatingText) {
      dictationRecRef.current.stop();
    } else {
      // Cancel active text to speech if any to avoid mic echo feedback
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setPlayingMsgIdx(null);
      dictationRecRef.current.start();
    }
  };

  const copyMessageText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgIdx(idx);
    setTimeout(() => setCopiedMsgIdx(null), 2000);
  };

  const toggleSpeakMessage = (text: string, idx: number) => {
    if (playingMsgIdx === idx) {
      // Currently playing, stop it
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setPlayingMsgIdx(null);
    } else {
      // Cancel any ongoing speaking first
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      setPlayingMsgIdx(idx);
      speakText(text, () => {
        setPlayingMsgIdx(null);
      });
    }
  };

  const getBreathInstruction = () => {
    switch (breathStage) {
      case 0:
        return { text: "Inhale Deeply", desc: "Feel the healing oxygen fill your body...", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
      case 1:
        return { text: "Hold your breath", desc: "Suspend in complete calm and stillness...", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
      case 2:
        return { text: "Exhale Slowly", desc: "Let go of all stressors, tension, and weight...", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" };
      case 3:
      default:
        return { text: "Hold", desc: "Rest peacefully in the space between breaths...", color: "text-slate-400 bg-slate-500/10 border-slate-500/20" };
    }
  };

  // Ensure there is an active session
  useEffect(() => {
    if (sessions.length === 0 && !didSeed.current) {
      didSeed.current = true;
      const initialSession: ChatSession = {
        id: `session_${Date.now()}`,
        title: "Initial Calm Check-in",
        messages: [
          {
            sender: "assistant",
            text: `Hello, ${userProfile.nickname || "friend"}. I'm PsycHeal, your mental wellness companion. I'm here to listen, offer supportive coping techniques, and walk with you through any stress, anxiety, or heavy feelings. \n\nWhat's on your mind today?`,
            timestamp: new Date().toISOString()
          }
        ],
        updatedAt: new Date().toISOString()
      };
      onAddSession(initialSession);
      setActiveSessionId(initialSession.id);
    } else if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId, isGenerating]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isGenerating || !activeSession) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...activeSession.messages, userMsg];
    onUpdateSessionMessages(activeSession.id, updatedMessages);
    setInputText('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      });
      const data = await response.json();

      const assistantMsg: ChatMessage = {
        sender: "assistant",
        text: data.text || "I am listening closely. Let's explore that together.",
        timestamp: new Date().toISOString()
      };

      onUpdateSessionMessages(activeSession.id, [...updatedMessages, assistantMsg]);
    } catch (err) {
      console.error("Failed to query chat server:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Start Voice Call mode
  const startVoiceCall = () => {
    setIsVoiceMode(true);
    setSpeechError('');
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    speakCalmingIntro();
  };

  const stopVoiceActivity = () => {
    setIsVoiceMode(false);
    setIsListening(false);
    setIsSpeaking(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
  };

  const speakCalmingIntro = () => {
    const greeting = `I'm ready, ${userProfile.nickname}. I am here to listen with absolute warmth. What would you like to speak about?`;
    speakText(greeting, () => {
      startListeningLoop();
    });
  };

  const startListeningLoop = () => {
    if (recognitionRef.current && !isSpeaking && isVoiceMode) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already listening or starting
      }
    }
  };

  const handleVoiceInputReceived = async (text: string) => {
    // Add user voice input to active chat log
    if (!activeSession) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text,
      timestamp: new Date().toISOString()
    };
    const updatedMessages = [...activeSession.messages, userMsg];
    onUpdateSessionMessages(activeSession.id, updatedMessages);

    setIsGenerating(true);

    try {
      const response = await fetch('/api/voice-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text })
      });
      const data = await response.json();
      const replyText = data.text || "I hear you, and I am entirely here for you.";

      const assistantMsg: ChatMessage = {
        sender: "assistant",
        text: replyText,
        timestamp: new Date().toISOString()
      };
      onUpdateSessionMessages(activeSession.id, [...updatedMessages, assistantMsg]);

      setIsGenerating(false);

      // Speak back
      speakText(replyText, () => {
        // Re-start listening after speaking completes
        if (isVoiceMode) {
          startListeningLoop();
        }
      });

    } catch (error) {
      console.error(error);
      setIsGenerating(false);
      speakText("I am here and holding space for you. Feel free to speak.", () => {
        if (isVoiceMode) startListeningLoop();
      });
    }
  };

  // Speak text aloud using optimized voices from ElevenLabs via /api/tts (with Gemini fallback) and browser fallback
  const speakText = async (text: string, onComplete: () => void) => {
    // 1. Stop any current browser synthesis utterance
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    // 2. Stop any currently playing audio element first
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    setIsSpeaking(true);

    // Filter out code symbols or markdown before speaking for a perfectly clean audio experience
    const cleanText = text.replace(/\[.*?\]/g, "").replace(/\*+/g, "").trim();

    try {
      // Fetch /api/tts to route through the secure full-stack backend voice service
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voiceName: selectedVoice, // 'nova' or 'capella'
        })
      });

      const data = await response.json();
      if (data && data.audio && !data.error) {
        // High-fidelity voice received successfully! Create audio element for playback
        const audioUrl = `data:audio/wav;base64,${data.audio}`;
        const audio = new Audio(audioUrl);
        activeAudioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          onComplete();
        };

        audio.onerror = (err) => {
          console.warn("Audio playback error, falling back to local speech synthesis", err);
          runLocalSpeechSynthesisFallback(cleanText, onComplete);
        };

        await audio.play();
        return;
      }
    } catch (err) {
      console.warn("Failed to fetch official TTS, falling back to local speech synthesis", err);
    }

    // Local offline SpeechSynthesis fallback
    runLocalSpeechSynthesisFallback(cleanText, onComplete);
  };

  const runLocalSpeechSynthesisFallback = (cleanText: string, onComplete: () => void) => {
    if (!synthRef.current) {
      setIsSpeaking(false);
      onComplete();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentUtteranceRef.current = utterance;

    const voices = synthRef.current.getVoices();
    let preferredVoice = null;

    if (selectedVoice === "nova") {
      // Nova: Empathetic, calming, and soothing female voice
      preferredVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        return v.lang.startsWith("en") && 
               (name.includes("natural") || name.includes("neural") || name.includes("premium")) && 
               (name.includes("female") || name.includes("aria") || name.includes("sara") || name.includes("jenny") || name.includes("aura"));
      });
      if (!preferredVoice) {
        preferredVoice = voices.find(v => {
          const name = v.name.toLowerCase();
          return (name.includes("google us english") || 
                  name.includes("google english") || 
                  name.includes("samantha") || 
                  name.includes("zira") || 
                  name.includes("female")) && v.lang.startsWith("en");
        });
      }
      utterance.pitch = 1.0;
      utterance.rate = 0.88;
    } else {
      // Capella: Calm, wise, grounding male voice
      preferredVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        return v.lang.startsWith("en") && 
               (name.includes("natural") || name.includes("neural") || name.includes("premium")) && 
               (name.includes("male") || name.includes("guy") || name.includes("stefan") || name.includes("ryan") || name.includes("george"));
      });
      if (!preferredVoice) {
        preferredVoice = voices.find(v => {
          const name = v.name.toLowerCase();
          return (name.includes("david") || 
                  name.includes("google uk english male") || 
                  name.includes("microsoft") || 
                  name.includes("daniel") || 
                  name.includes("george")) && v.lang.startsWith("en");
        });
      }
      utterance.pitch = 1.0;
      utterance.rate = 0.86;
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      onComplete();
    };

    utterance.onerror = (e) => {
      console.warn("Speech Synthesis error:", e);
      setIsSpeaking(false);
      onComplete();
    };

    synthRef.current.speak(utterance);
  };

  const handleInterruptSpeech = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    startListeningLoop();
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-brand-bg overflow-hidden h-full" id="companion-root">
      
      {/* Sessions Left Rail (Desktop) */}
      <div className="w-full md:w-64 border-r border-brand-border bg-white flex flex-col shrink-0" id="companion-sessions-rail">
        <div className="p-4 border-b border-brand-border">
          <button
            onClick={() => {
              const newSess: ChatSession = {
                id: `session_${Date.now()}`,
                title: `Check-in ${new Date().toLocaleDateString()}`,
                messages: [
                  {
                    sender: "assistant",
                    text: "I am ready. Tell me, what's been moving within your mind lately?",
                    timestamp: new Date().toISOString()
                  }
                ],
                updatedAt: new Date().toISOString()
              };
              onAddSession(newSess);
              setActiveSessionId(newSess.id);
            }}
            className="w-full py-3 px-4 border border-indigo-200 hover:bg-indigo-50/50 text-brand-primary rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            id="new-session-btn"
          >
            <Sparkles className="w-4 h-4" /> New Safe Space
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <p className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider px-2 mb-2">My Conversations</p>
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => {
                stopVoiceActivity();
                setActiveSessionId(s.id);
              }}
              className={`w-full text-left p-3 rounded-xl text-xs font-bold transition-all truncate block cursor-pointer ${
                activeSessionId === s.id
                  ? 'bg-slate-100 text-brand-secondary border-l-4 border-brand-primary'
                  : 'text-brand-text-muted hover:bg-slate-50'
              }`}
              id={`session-item-${s.id}`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Dedicated API Key Configuration Information Card */}
        <div className="p-4 border-t border-brand-border bg-slate-50/50">
          <div className={`${
            theme === 'light' 
              ? 'bg-[#f4f7f5] border-[#d2edd8]' 
              : 'bg-[#1c2124] border-[#2c373e]'
          } border p-3 rounded-xl text-[11px] leading-relaxed`}>
            <div className="flex items-center gap-1.5 font-bold text-brand-primary mb-1 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>API Key Configuration</span>
            </div>
            <p className="text-brand-text-muted mb-2 font-semibold">
              PsycHeal leverages advanced clinical reasoning models on our secure full-stack backend.
            </p>
            <div className="space-y-1 text-brand-text-muted">
              <p className={`font-extrabold text-[9px] uppercase tracking-wider ${
                theme === 'light' ? 'text-brand-secondary' : 'text-white'
              }`}>To activate CBT plans & AI:</p>
              <ol className="list-decimal pl-3.5 space-y-1 font-bold">
                <li>Acquire the standard reasoning key.</li>
                <li>Go to Settings &gt; Secrets panel.</li>
                <li>Bind key to <code className={`px-1 py-0.5 rounded text-[9px] font-mono ${
                  theme === 'light' ? 'bg-[#eaf6ed] text-[#2c6e49]' : 'bg-[#111] text-[#5bb374]'
                }`}>GEMINI_API_KEY</code>.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Main Space */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Toggle between Normal Chat and Immersive Voice Call */}
        <header className="p-4 bg-white border-b border-brand-border flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-brand-primary rounded-xl flex items-center justify-center border border-indigo-100">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-brand-secondary">PsycHeal AI Companion</h3>
              <p className="text-[10px] text-brand-text-muted font-bold flex items-center gap-1 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" /> Calming Space Live
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowApiInfo(prev => !prev)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                showApiInfo
                  ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                  : 'bg-slate-50 border-brand-border text-brand-text-muted hover:text-brand-secondary hover:bg-slate-100'
              }`}
              title="API Key Configuration Guide"
              id="show-api-info-btn"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">API Config</span>
            </button>

            {isVoiceMode ? (
              <button
                onClick={stopVoiceActivity}
                className="py-2 px-3.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                id="end-voice-call-btn"
              >
                <PhoneOff className="w-4 h-4" /> End Call
              </button>
            ) : (
              <button
                onClick={startVoiceCall}
                className="py-2 px-3.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-brand-primary rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                id="start-voice-call-btn"
              >
                <PhoneCall className="w-4 h-4" /> Start Voice Call
              </button>
            )}
          </div>
        </header>

        {isVoiceMode ? (
          /* IMMERSIVE VOICE CALL VIEW (Features beautiful breathing grounding orb) */
          <div className="flex-1 flex flex-col justify-between p-6 bg-linear-to-b from-slate-950 to-indigo-950 text-white overflow-y-auto relative" id="voice-call-screen">
            
            <div className="absolute top-4 left-4 right-4 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl text-[11px] text-slate-300 flex gap-2.5 z-10" id="voice-call-disclaimer">
              <Info className="w-4 h-4 flex-shrink-0 text-brand-primary mt-0.5" />
              <div>
                <span className="font-bold text-white">Somatic Voice Call:</span> Speak naturally. PsycHeal uses cognitive-behavioral grounding, active listening, and customized comforting responses in a slow, calming voice. Tap the central orb at any time to interrupt speech or capture.
              </div>
            </div>

            {/* Breathing Grounding Orb Workspace */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 py-12">
              
              <div className="relative flex items-center justify-center mt-12">
                {/* Outermost breathing boundary ripple */}
                <div className={`absolute rounded-full bg-indigo-500/10 border border-indigo-500/20 transition-all duration-[4s] ease-in-out ${
                  isSpeaking ? 'w-80 h-80 animate-ping' : isListening ? 'w-72 h-72 scale-105' : 'w-64 h-64 scale-95'
                }`} />

                {/* Secondary breathing halo */}
                <div className={`absolute rounded-full bg-brand-primary/20 transition-all duration-[4s] ease-in-out ${
                  isSpeaking ? 'w-64 h-64 scale-110' : isListening ? 'w-56 h-56 scale-100 animate-pulse' : 'w-48 h-48 scale-90'
                }`} />

                {/* Central interactive orb button */}
                <button
                  onClick={handleInterruptSpeech}
                  className={`w-36 h-36 rounded-full flex flex-col items-center justify-center relative cursor-pointer focus:outline-none transition-all duration-500 shadow-2xl ${
                    isSpeaking 
                      ? 'bg-linear-to-tr from-brand-primary to-indigo-500 hover:opacity-90 shadow-brand-primary/40' 
                      : isListening 
                        ? 'bg-linear-to-tr from-emerald-500 to-teal-400 shadow-emerald-500/30' 
                        : 'bg-linear-to-tr from-slate-800 to-indigo-900 border border-slate-700'
                  }`}
                  id="voice-call-orb-btn"
                >
                  {isSpeaking ? (
                    <Volume2 className="w-10 h-10 animate-bounce" />
                  ) : isListening ? (
                    <Mic className="w-10 h-10 text-white animate-pulse" />
                  ) : (
                    <Bot className="w-10 h-10 text-indigo-300" />
                  )}
                  <span className="text-[9px] font-black uppercase tracking-widest mt-2 block">
                    {isSpeaking ? "Tap to skip" : isListening ? "Listening" : "Pulsing"}
                  </span>
                </button>
              </div>

              {/* Dynamic Simulated Audio Waveform */}
              <div className="h-10 flex items-center justify-center gap-1 mt-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((barIdx) => {
                  const delay = (barIdx % 4) * 0.15;
                  return (
                    <motion.div
                      key={barIdx}
                      animate={isSpeaking ? {
                        height: [8, 36, 12, 28, 8]
                      } : isListening ? {
                        height: [6, 18, 6]
                      } : {
                        height: [6, 6, 6]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: isSpeaking ? 1.0 : 1.6,
                        delay: delay,
                        ease: "easeInOut"
                      }}
                      className={`w-1 rounded-full transition-all duration-500 ${
                        isSpeaking 
                          ? 'bg-brand-primary' 
                          : isListening 
                            ? 'bg-emerald-400' 
                            : 'bg-slate-700'
                      }`}
                    />
                  );
                })}
              </div>

              {/* Status Indicator Labels */}
              <div className="text-center">
                <p className="text-sm font-extrabold text-white">
                  {isListening ? "Listening to your voice..." : isSpeaking ? "PsycHeal is speaking..." : "Calmly Breathing..."}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-1.5 max-w-xs mx-auto leading-relaxed uppercase tracking-wider">
                  {isListening ? "Feel free to share anything on your mind." : isSpeaking ? "Tap the pulsating orb above to pause speech." : "Take a slow, deep breath matching the circle's rhythm."}
                </p>
              </div>

              {/* Box Breathing Somatic Guide Card */}
              <div className="w-full max-w-xs mx-auto">
                <div className={`p-4 rounded-2xl border transition-all duration-500 flex flex-col items-center text-center ${getBreathInstruction().color}`}>
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider mb-1">
                    <Wind className="w-4 h-4" />
                    <span>Somatic Grounding Breath</span>
                  </div>
                  <h4 className="text-base font-black tracking-tight">{getBreathInstruction().text} ({breathSeconds}s)</h4>
                  <p className="text-[10px] opacity-80 mt-0.5 font-medium">{getBreathInstruction().desc}</p>
                  
                  {/* Box Breathing Progress Dots */}
                  <div className="flex gap-1.5 mt-3">
                    {[0, 1, 2, 3].map((stageIdx) => (
                      <div 
                        key={stageIdx} 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          breathStage === stageIdx 
                            ? 'w-6 bg-current' 
                            : 'w-2 bg-current/25'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Control Panel Footer */}
            <div className="border-t border-slate-950 pt-4 flex flex-col items-center gap-3">
              {/* Voice selector */}
              <div className="flex gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
                <button
                  onClick={() => setSelectedVoice("nova")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedVoice === "nova" 
                      ? 'bg-brand-primary text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                  id="voice-select-nova-btn"
                >
                  👭 Psycheal Calm
                </button>
                <button
                  onClick={() => setSelectedVoice("capella")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedVoice === "capella" 
                      ? 'bg-brand-primary text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                  id="voice-select-capella-btn"
                >
                  👨 Psycheal Serenity
                </button>
              </div>

              {speechError && (
                <p className="text-[10px] text-amber-400 font-bold leading-normal text-center max-w-md bg-amber-950/20 p-2 rounded-lg border border-amber-900/30">
                  {speechError}
                </p>
              )}
            </div>

          </div>
        ) : (
          /* TEXT CHAT VIEW */
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
            
            {/* Healing Ambient Glow Elements behind messages */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
              <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-300/10 rounded-full blur-3xl" />
              <div className="absolute top-2/3 left-1/3 w-96 h-96 bg-teal-200/5 rounded-full blur-3xl" />
            </div>

            {/* Conversation list area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-silver-chat relative z-10" id="chat-messages-container">
              <AnimatePresence initial={false}>
                {activeSession?.messages.map((msg, idx) => {
                  const isUser = msg.sender === 'user';
                  const isPlaying = playingMsgIdx === idx;
                  const isCopied = copiedMsgIdx === idx;
                  
                  return (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start gap-3 max-w-xl md:max-w-2xl ${isUser ? 'flex-row-reverse' : ''}`}>
                        
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 shadow-md ${
                          isUser ? 'chat-avatar-user bg-linear-to-tr from-indigo-600 to-indigo-500' : 'chat-avatar-assistant bg-linear-to-tr from-emerald-600 to-teal-500'
                        }`}>
                          {isUser ? userProfile.nickname.substring(0, 1).toUpperCase() : '🌿'}
                        </div>

                        {/* Bubble and Action Bar Wrapper */}
                        <div className="flex flex-col gap-1.5 group max-w-xs sm:max-w-md md:max-w-lg">
                          <div className={`p-4 rounded-2xl text-xs leading-relaxed font-semibold whitespace-pre-wrap shadow-md ${
                            isUser 
                              ? 'chat-bubble-user rounded-tr-none' 
                              : 'chat-bubble-assistant rounded-tl-none border border-slate-200/50 dark:border-brand-border/40'
                          }`}>
                            {msg.text}
                          </div>

                          {/* Interactive Audio & Clipboard controls for assistant responses */}
                          {!isUser && (
                            <div className="flex items-center gap-3 px-2 py-0.5 opacity-65 group-hover:opacity-100 transition-all text-[10px] font-bold text-brand-text-muted">
                              <button
                                type="button"
                                onClick={() => toggleSpeakMessage(msg.text, idx)}
                                className={`flex items-center gap-1.5 hover:text-brand-primary transition-all cursor-pointer ${isPlaying ? 'text-brand-primary' : ''}`}
                                title="Listen to reflection"
                              >
                                {isPlaying ? (
                                  <>
                                    <span className="flex h-2 w-2 relative">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span>Playing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3.5 h-3.5" />
                                    <span>Read aloud</span>
                                  </>
                                )}
                              </button>

                              <span className="text-slate-300 dark:text-slate-800">|</span>

                              <button
                                type="button"
                                onClick={() => copyMessageText(msg.text, idx)}
                                className="flex items-center gap-1.5 hover:text-brand-primary transition-all cursor-pointer"
                                title="Copy response to clipboard"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-emerald-500 font-bold">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* CBT Suggested Prompts Grid */}
              {activeSession?.messages.length <= 1 && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mt-6 pt-4 border-t border-brand-border/40 max-w-2xl mx-auto relative z-10"
                >
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <Compass className="w-4 h-4 text-brand-primary" />
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand-text-muted">CBT Reflection Starters</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {SUGGESTED_PROMPTS.map((item, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleSendMessage(item.prompt)}
                        className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-md flex flex-col gap-1.5 ${item.color}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{item.icon}</span>
                          <span className="text-xs font-extrabold tracking-tight">{item.title}</span>
                        </div>
                        <p className="text-[10px] leading-relaxed font-medium opacity-85">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Generating Loader */}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3 max-w-xl">
                    <div className="w-9 h-9 rounded-xl chat-avatar-assistant bg-linear-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shrink-0 shadow-md">
                      🌿
                    </div>
                    <div className="chat-loader-bubble p-3.5 rounded-2xl rounded-tl-none text-[11px] font-bold flex items-center gap-1.5 shadow-md">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
                      <span>PsycHeal is reflecting...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form area */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="p-4 border-t border-brand-border bg-white flex gap-2 shrink-0 items-center relative z-10"
              id="chat-input-form"
            >
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isDictatingText ? "Listening closely... speak now" : "Share your feelings, stressors, or reflect openly..."}
                  disabled={isGenerating}
                  className={`w-full p-3.5 pr-12 border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-slate-50/70 transition-all ${isDictatingText ? 'ring-2 ring-emerald-500 border-transparent placeholder-emerald-600 font-bold bg-emerald-500/5' : ''}`}
                  id="chat-text-input"
                />
                
                {/* Dictation Microphone Icon inside input field */}
                <button
                  type="button"
                  onClick={toggleDictation}
                  className={`absolute right-3 p-1.5 rounded-lg transition-all cursor-pointer ${
                    isDictatingText 
                      ? 'bg-rose-500 text-white animate-pulse shadow-md' 
                      : 'text-brand-text-muted hover:text-brand-secondary hover:bg-slate-100'
                  }`}
                  title={isDictatingText ? "Stop dictating" : "Dictate your thought"}
                >
                  {isDictatingText ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() || isGenerating}
                className="p-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                id="chat-send-btn"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}
