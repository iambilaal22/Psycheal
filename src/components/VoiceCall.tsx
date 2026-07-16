import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Settings, 
  Cpu, 
  Check, 
  ChevronRight, 
  Activity, 
  ShieldCheck, 
  Maximize2,
  Info
} from 'lucide-react';
import { UserProfile } from '../types';

interface VoiceCallProps {
  userProfile: UserProfile;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export interface GeminiVoiceProfile {
  id: string;
  name: string;
  gender: 'female' | 'male';
  tone: string;
  pitchAdjust: number;
  rateAdjust: number;
  description: string;
  keywords: string[];
}

export const GEMINI_VOICES: GeminiVoiceProfile[] = [
  {
    id: 'signature',
    name: 'Psycheal Signature',
    gender: 'female',
    tone: 'Studio-grade, high-fidelity warmth',
    pitchAdjust: 1.0,
    rateAdjust: 0.0,
    description: 'Our primary, ultra-realistic voice optimized for warm emotional counseling and continuous verbal pacing.',
    keywords: ['siri', 'samantha', 'aria', 'female', 'google us english', 'zira', 'karen']
  },
  {
    id: 'nova',
    name: 'Psycheal Calm',
    gender: 'female',
    tone: 'Calm, supportive, mid-range',
    pitchAdjust: 0.98,
    rateAdjust: -0.05,
    description: 'A mellow, soothing female voice optimized for anxiety relief and calm somatic guidance.',
    keywords: ['siri', 'samantha', 'aria', 'female', 'google us english', 'zira', 'karen']
  },
  {
    id: 'vega',
    name: 'Psycheal Warm',
    gender: 'female',
    tone: 'Bright, energetic, high-pitch',
    pitchAdjust: 1.06,
    rateAdjust: 0.05,
    description: 'A bright, positive female voice for structured cognitive reframing and motivational coaching.',
    keywords: ['jenny', 'zira', 'samantha', 'aria', 'natural', 'female', 'hazel']
  },
  {
    id: 'ursa',
    name: 'Psycheal Hope',
    gender: 'female',
    tone: 'Engaged, mid-range',
    pitchAdjust: 1.0,
    rateAdjust: 0.0,
    description: 'A natural, balanced female voice with a warm, conversational, and highly engaged presence.',
    keywords: ['samantha', 'aria', 'google us english', 'female', 'zira', 'siri']
  },
  {
    id: 'orbit',
    name: 'Psycheal Harmony',
    gender: 'male',
    tone: 'Energetic, high-pitch',
    pitchAdjust: 1.04,
    rateAdjust: 0.04,
    description: 'An enthusiastic, friendly male voice with an energetic rhythm and bright tone.',
    keywords: ['google uk english male', 'david', 'guy', 'male', 'microsoft guy', 'he-il', 'mark']
  },
  {
    id: 'lyra',
    name: 'Psycheal Focus',
    gender: 'female',
    tone: 'Bright, energetic, high-pitch',
    pitchAdjust: 1.08,
    rateAdjust: 0.06,
    description: 'An exceptionally bright, crisp female voice that is vibrant and highly engaging.',
    keywords: ['jenny', 'zira', 'aria', 'samantha', 'female', 'tessa']
  },
  {
    id: 'capella',
    name: 'Psycheal Serenity',
    gender: 'male',
    tone: 'Calm, supportive, low-pitch',
    pitchAdjust: 0.92,
    rateAdjust: -0.04,
    description: 'A deep, calming male voice perfect for somatic breathing and grounding biofeedback.',
    keywords: ['david', 'guy', 'male', 'microsoft guy', 'google uk english male', 'george']
  },
  {
    id: 'eclipse',
    name: 'Psycheal Gentle',
    gender: 'male',
    tone: 'Calm, supportive, mid-range',
    pitchAdjust: 0.96,
    rateAdjust: -0.02,
    description: 'A smooth, balanced male voice providing a highly supportive, grounding presence.',
    keywords: ['david', 'guy', 'male', 'microsoft guy', 'google uk english male', 'ravi']
  },
  {
    id: 'gemma',
    name: 'Psycheal Joy',
    gender: 'female',
    tone: 'Bright, energetic, low-pitch',
    pitchAdjust: 0.94,
    rateAdjust: 0.02,
    description: 'A rich, low-pitched female voice that blends warmth with professional clarity.',
    keywords: ['google us english', 'samantha', 'aria', 'zira', 'female', 'karen']
  },
  {
    id: 'orion',
    name: 'Psycheal Energy',
    gender: 'male',
    tone: 'Bright, energetic, high-pitch',
    pitchAdjust: 1.02,
    rateAdjust: 0.05,
    description: 'A vibrant, animated male voice that is highly motivating and crisp.',
    keywords: ['google uk english male', 'david', 'guy', 'male', 'microsoft guy', 'mark']
  },
  {
    id: 'pinnacle',
    name: 'Psycheal Peace',
    gender: 'male',
    tone: 'Calm, supportive, low-pitch',
    pitchAdjust: 0.90,
    rateAdjust: -0.06,
    description: 'A rich, deep, resonant male voice optimized for deep relaxation and meditation.',
    keywords: ['david', 'guy', 'male', 'microsoft guy', 'google uk english male', 'george']
  }
];

export default function VoiceCall({ userProfile }: VoiceCallProps) {
  const [model, setModel] = useState<string>('signature');
  const [activeVoiceTab, setActiveVoiceTab] = useState<'all' | 'female' | 'male'>('all');
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<Message[]>([
    { role: 'assistant', text: 'Hello, I am ready to support your emotional wellness today. Please select your preferred Psycheal voice profile from our high-fidelity options.' }
  ]);
  const [interimSpeech, setInterimSpeech] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPremiumVoice, setIsPremiumVoice] = useState<boolean | null>(null);

  // Audio Output Only Mode & Pro Voice daily limit trackers
  const [isAudioOnlyMode, setIsAudioOnlyMode] = useState<boolean>(true);
  const [proVoiceCount, setProVoiceCount] = useState<number>(0);
  const [elevenLabsConfigured, setElevenLabsConfigured] = useState<boolean>(false);

  // LocalStorage helpers to track Pro Voice Mode requests (limit 2/day)
  const getProVoiceUsage = () => {
    if (typeof window === 'undefined' || !window.localStorage) return 0;
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('proVoiceDate');
    const storedCountStr = localStorage.getItem('proVoiceCount');
    
    if (storedDate !== today) {
      localStorage.setItem('proVoiceDate', today);
      localStorage.setItem('proVoiceCount', '0');
      return 0;
    }
    
    return storedCountStr ? parseInt(storedCountStr, 10) : 0;
  };

  const incrementProVoiceUsage = () => {
    if (typeof window === 'undefined' || !window.localStorage) return 0;
    const today = new Date().toDateString();
    const currentCount = getProVoiceUsage();
    const nextCount = currentCount + 1;
    localStorage.setItem('proVoiceDate', today);
    localStorage.setItem('proVoiceCount', nextCount.toString());
    return nextCount;
  };

  useEffect(() => {
    setProVoiceCount(getProVoiceUsage());
    fetch('/api/check-key')
      .then(res => res.json())
      .then(data => {
        if (data.elevenLabsConfigured) {
          setElevenLabsConfigured(true);
        }
      })
      .catch(err => console.warn("Failed to check ElevenLabs configuration in VoiceCall:", err));
  }, []);

  // Soothing Voice Customization States
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [profileVoiceBindings, setProfileVoiceBindings] = useState<Record<string, string>>({});
  const [voiceRate, setVoiceRate] = useState<number>(0.82); // Slow & soothing rate (default 1.0 is too rushed/harsh)
  const [voicePitch, setVoicePitch] = useState<number>(1.0); // 1.0 = Standard warm tone

  // Load and auto-select highest fidelity empathetic voices available on user's device
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const allVoices = window.speechSynthesis.getVoices();
        // Filter to English or fallback to all voices
        const englishVoices = allVoices.filter(v => v.lang.toLowerCase().startsWith('en'));
        const listToUse = englishVoices.length > 0 ? englishVoices : allVoices;
        setVoices(listToUse);

        // Map every Gemini Voice Profile to the best matched browser voice
        const bindings: Record<string, string> = {};
        GEMINI_VOICES.forEach(profile => {
          let matched = null;
          const isFemaleProfile = profile.gender === 'female';

          if (isFemaleProfile) {
            // 1. Try to find a premium/natural female voice that matches the profile's keywords and doesn't contain male indicators
            matched = listToUse.find(v => {
              const name = v.name.toLowerCase();
              const isMaleName = name.includes('male') || name.includes('guy') || name.includes('david') || name.includes('stefan') || name.includes('ryan') || name.includes('george') || name.includes('daniel') || name.includes('puck') || name.includes('charon') || name.includes('fenrir');
              return !isMaleName && profile.keywords.some(kw => name.includes(kw));
            });

            // 2. If not found, try to find ANY female voice or general voice that doesn't contain male indicators
            if (!matched) {
              matched = listToUse.find(v => {
                const name = v.name.toLowerCase();
                const isMaleName = name.includes('male') || name.includes('guy') || name.includes('david') || name.includes('stefan') || name.includes('ryan') || name.includes('george') || name.includes('daniel') || name.includes('puck') || name.includes('charon') || name.includes('fenrir');
                return !isMaleName && (name.includes('female') || name.includes('zira') || name.includes('samantha') || name.includes('jenny') || name.includes('aria') || name.includes('siri') || name.includes('karen') || name.includes('hazel') || name.includes('tessa') || name.includes('sara') || name.includes('aura') || name.includes('bella') || name.includes('rachel') || name.includes('kore') || name.includes('aoede'));
              });
            }

            // 3. Fallback to any voice that doesn't contain male indicators
            if (!matched) {
              matched = listToUse.find(v => {
                const name = v.name.toLowerCase();
                return !(name.includes('male') || name.includes('guy') || name.includes('david') || name.includes('stefan') || name.includes('ryan') || name.includes('george') || name.includes('daniel') || name.includes('puck') || name.includes('charon') || name.includes('fenrir'));
              });
            }
          } else {
            // For male profiles, prefer voices that have male indicators
            matched = listToUse.find(v => {
              const name = v.name.toLowerCase();
              const isMaleName = name.includes('male') || name.includes('guy') || name.includes('david') || name.includes('stefan') || name.includes('ryan') || name.includes('george') || name.includes('daniel') || name.includes('puck') || name.includes('charon') || name.includes('fenrir');
              return isMaleName && profile.keywords.some(kw => name.includes(kw));
            });

            if (!matched) {
              matched = listToUse.find(v => {
                const name = v.name.toLowerCase();
                return name.includes('male') || name.includes('guy') || name.includes('david') || name.includes('stefan') || name.includes('ryan') || name.includes('george') || name.includes('daniel') || name.includes('puck') || name.includes('charon') || name.includes('fenrir');
              });
            }
          }

          // Ultimate fallback
          if (!matched) {
            matched = listToUse[0];
          }

          if (matched) {
            bindings[profile.id] = matched.name;
          }
        });
        setProfileVoiceBindings(bindings);
      };

      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll transcript
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, interimSpeech]);

  // Handle Call Timer
  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setCallDuration(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // Web Speech API - Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        let interimText = '';
        let finalReply = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalReply += event.results[i][0].transcript;
          } else {
            interimText += event.results[i][0].transcript;
          }
        }

        if (interimText) {
          setInterimSpeech(interimText);
        }

        if (finalReply) {
          setInterimSpeech('');
          handleUserSpeechSubmitted(finalReply);
        }
      };

      rec.onerror = (e: any) => {
        console.warn('Speech Recognition Notice (expected in headless or mic-disabled environments):', e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (activeAudioElementRef.current) {
        activeAudioElementRef.current.pause();
        activeAudioElementRef.current = null;
      }
    };
  }, []);

  // Format Duration helper
  const formatDuration = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Fallback: run local browser SpeechSynthesis if server endpoint is offline, missing key, or fails
  const runFallbackSpeechSynthesis = (cleanSpeechText: string) => {
    if (!synthRef.current) {
      setAiSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    
    // Bind selected voice
    const activeVoiceName = profileVoiceBindings[model];
    if (activeVoiceName) {
      const activeVoice = voices.find(v => v.name === activeVoiceName);
      if (activeVoice) {
        utterance.voice = activeVoice;
      }
    }

    // Set empathetic pace and vocal tones (slow speech sounds far less mechanical and harsh)
    utterance.rate = voiceRate;
    utterance.pitch = voicePitch;

    // Apply extra model-specific soft micro-adjustments matching official Gemini voices
    const currentProfile = GEMINI_VOICES.find(p => p.id === model) || GEMINI_VOICES[0];
    if (currentProfile.rateAdjust < 0) {
      utterance.rate = Math.max(0.65, voiceRate + currentProfile.rateAdjust);
    } else {
      utterance.rate = Math.min(1.20, voiceRate + currentProfile.rateAdjust);
    }

    if (currentProfile.pitchAdjust < 1.0) {
      utterance.pitch = Math.max(0.80, voicePitch * currentProfile.pitchAdjust);
    } else {
      utterance.pitch = Math.min(1.30, voicePitch * currentProfile.pitchAdjust);
    }

    utterance.onstart = () => {
      setAiSpeaking(true);
    };

    utterance.onend = () => {
      setAiSpeaking(false);
      // Restart speech recognition automatically for continuous therapeutic flow
      if (callStatus === 'connected' && !isMuted && recognitionRef.current && !isRecording) {
        try {
          recognitionRef.current.start();
        } catch (_) {}
      }
    };

    utterance.onerror = () => {
      setAiSpeaking(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  // Speaks out the text using premium Gemini TTS or falling back to local SpeechSynthesis
  const speakText = async (text: string) => {
    if (!isSpeakerOn) return;
    
    // Stop any currently playing audio element first
    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.pause();
      activeAudioElementRef.current = null;
    }
    
    // Stop any current browser synthesis utterance
    if (synthRef.current) {
      synthRef.current.cancel();
    }

    // Remove bracketed info entirely and other markdown/asterisks to prevent mechanical punctuation reading
    const cleanSpeechText = text
      .replace(/\[[^\]]*\]/g, '') // remove bracketed content completely
      .replace(/[*_#`]/g, '');   // remove markdown symbols

    setAiSpeaking(true);

    // If the 2 Pro Voice requests daily limit is reached (and ElevenLabs is not configured), immediately run fallback offline synthesis
    if (proVoiceCount >= 2 && !elevenLabsConfigured) {
      setIsPremiumVoice(false);
      runFallbackSpeechSynthesis(cleanSpeechText);
      return;
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanSpeechText,
          voiceName: model,
        })
      });

      const data = await response.json();
      if (data && data.audio && data.isOfficial) {
        // Increment daily count upon successful official voice generation
        const nextCount = incrementProVoiceUsage();
        setProVoiceCount(nextCount);
        setIsPremiumVoice(true);

        // High-fidelity voice received successfully! Create standard Audio element for beautiful human playback
        const audioUrl = `data:audio/wav;base64,${data.audio}`;
        const audio = new Audio(audioUrl);
        activeAudioElementRef.current = audio;

        audio.onended = () => {
          setAiSpeaking(false);
          // Restart speech recognition automatically for continuous therapeutic flow
          if (callStatus === 'connected' && !isMuted && recognitionRef.current && !isRecording) {
            try {
              recognitionRef.current.start();
            } catch (_) {}
          }
        };

        audio.onerror = (err) => {
          console.warn("Audio playback error, falling back to local speech synthesis", err);
          setIsPremiumVoice(false);
          runFallbackSpeechSynthesis(cleanSpeechText);
        };

        await audio.play();
        return;
      }
    } catch (err) {
      console.warn("Failed to fetch official Gemini TTS, falling back to local speech synthesis", err);
    }

    // Fallback if API fails or is not available
    setIsPremiumVoice(false);
    runFallbackSpeechSynthesis(cleanSpeechText);
  };

  // Speaks a quick calm preview phrase to let user listen to custom tuning instantly
  const playTestPhrase = async () => {
    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.pause();
      activeAudioElementRef.current = null;
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }

    const currentProfile = GEMINI_VOICES.find(p => p.id === model) || GEMINI_VOICES[0];
    const testPhrase = `Hello, I am Gemini ${currentProfile.name}. Let us take a moment to breathe and connect in this calm space.`;

    setAiSpeaking(true);

    // Enforce Pro Voice limit on test phrase unless ElevenLabs is configured
    if (proVoiceCount >= 2 && !elevenLabsConfigured) {
       setIsPremiumVoice(false);
       runFallbackSpeechSynthesis(testPhrase);
       return;
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testPhrase,
          voiceName: model,
        })
      });

      const data = await response.json();
      if (data && data.audio && data.isOfficial) {
        // Increment daily count upon successful official voice generation
        const nextCount = incrementProVoiceUsage();
        setProVoiceCount(nextCount);
        setIsPremiumVoice(true);

        const audioUrl = `data:audio/wav;base64,${data.audio}`;
        const audio = new Audio(audioUrl);
        activeAudioElementRef.current = audio;

        audio.onended = () => setAiSpeaking(false);
        audio.onerror = () => {
          setIsPremiumVoice(false);
          runFallbackSpeechSynthesis(testPhrase);
        };

        await audio.play();
        return;
      }
    } catch (err) {
      console.warn("Test phrase TTS fetch failed, running local fallback", err);
    }

    setIsPremiumVoice(false);
    runFallbackSpeechSynthesis(testPhrase);
  };

  // Generate real AI response based on selected model
  const handleUserSpeechSubmitted = async (userText: string) => {
    if (!userText.trim()) return;

    // Add user question to transcript
    setTranscript(prev => [...prev, { role: 'user', text: userText }]);

    // Temporarily pause recognition while generating response & speaking
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }

    setAiSpeaking(true);

    const currentProfile = GEMINI_VOICES.find(p => p.id === model) || GEMINI_VOICES[0];

    try {
      // Format full conversation history (transcript) for the dedicated multi-turn Voice Reply endpoint
      const formattedTranscript = [
        ...transcript.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        })),
        {
          role: 'user',
          parts: [{ text: userText }]
        }
      ];

      const response = await fetch('/api/voice-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: formattedTranscript,
          voiceName: currentProfile.name,
          voiceTone: currentProfile.tone,
        })
      });

      const data = await response.json();
      const aiResponse = data.text || (currentProfile.id === 'nova' 
        ? "I hear how deep that feeling is. Take a gentle breath with me, breathing in calm, and releasing all tension."
        : `I am here to support you. Let's break down that feeling step-by-step together.`);

      setTranscript(prev => [...prev, { role: 'assistant', text: aiResponse }]);
      speakText(aiResponse);
    } catch (e) {
      console.error("Failed to generate voice reply, using local fallback:", e);
      const fallbackMsg = currentProfile.id === 'nova' 
        ? "I am here with you. Feel the weight of your feet on the ground and let everything else settle."
        : `Let's work through this together. We can find a structured way to look at this step-by-step.`;
      
      setTranscript(prev => [...prev, { role: 'assistant', text: fallbackMsg }]);
      speakText(fallbackMsg);
    }
  };

  // Start Call trigger
  const handleStartCall = () => {
    setCallStatus('connecting');
    if (synthRef.current) {
      synthRef.current.cancel();
    }

    const currentProfile = GEMINI_VOICES.find(p => p.id === model) || GEMINI_VOICES[0];

    setTimeout(() => {
      setCallStatus('connected');
      
      const greeting = `Welcome back to your safe space. I am ${currentProfile.name}. ${currentProfile.description}`;

      setTranscript([
        { role: 'assistant', text: greeting }
      ]);

      speakText(greeting);
    }, 1500);
  };

  // End Call trigger
  const handleEndCall = () => {
    setCallStatus('disconnected');
    setAiSpeaking(false);
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.pause();
      activeAudioElementRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }

    setTimeout(() => {
      setCallStatus('idle');
    }, 1000);
  };

  // Toggle Mute (Microphone control)
  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);

    if (recognitionRef.current) {
      if (nextMute) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      } else if (callStatus === 'connected' && !aiSpeaking) {
        try {
          recognitionRef.current.start();
        } catch (_) {}
      }
    }
  };

  // Toggle Speaker
  const toggleSpeaker = () => {
    const nextSpeaker = !isSpeakerOn;
    setIsSpeakerOn(nextSpeaker);
    if (!nextSpeaker) {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (activeAudioElementRef.current) {
        activeAudioElementRef.current.pause();
        activeAudioElementRef.current = null;
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-brand-bg p-6 md:p-10 space-y-8" id="voice-call-container">
      
      {/* Header section matching Kyan Health aesthetic */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-brand-secondary font-display tracking-tight">
            AI Voice Counselling
          </h2>
          <p className="text-[11px] text-brand-text-muted font-bold mt-1 uppercase tracking-widest">
            Immersive Somatic Auditory Guidance &amp; CBT Voice Core
          </p>
        </div>

        {/* Info label */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eaf6ed] border border-[#d2edd8] rounded-full text-[10px] font-bold text-[#2c6e49] uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" /> HIPAA compliant security
        </div>
      </header>

      {/* Main Two Column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Model details & Customization */}
        <div className="lg:col-span-5 space-y-6">

          {/* Pro Voice Mode Tracker Banner */}
          <div className="bg-gradient-to-br from-[#eaf6ed] to-white border border-[#d2edd8] rounded-2xl p-5 space-y-3 shadow-sm relative overflow-hidden" id="pro-voice-tracker-card">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#5bb374]/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-primary animate-pulse" />
                <span className="text-xs font-black text-brand-secondary uppercase tracking-wider">
                  {elevenLabsConfigured ? "Pro Voice Mode (Studio)" : "Pro Voice Mode"}
                </span>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider shadow-sm ${
                elevenLabsConfigured
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : proVoiceCount >= 2 
                    ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                    : 'bg-brand-primary text-white'
              }`}>
                {elevenLabsConfigured ? "Studio Voice Active" : proVoiceCount >= 2 ? "Limit Reached" : `${2 - proVoiceCount} / 2 Daily Left`}
              </span>
            </div>
            
            <p className="text-[11px] text-brand-text-muted leading-relaxed font-semibold">
              {elevenLabsConfigured ? (
                <span>
                  ✨ <strong className="text-emerald-600 font-bold">Studio Cloud Voice</strong> is active. Every call response is spoken via ultra-realistic, empathetic high-fidelity voices for continuous verbal counseling.
                </span>
              ) : proVoiceCount >= 2 ? (
                <span>
                  ⚠️ Daily limit of <strong className="text-rose-600 font-bold">2 Pro Voice requests</strong> reached. Currently running on <strong className="text-brand-secondary font-bold">Standard Voice</strong> (free, unlimited offline synthesizer).
                </span>
              ) : (
                <span>
                  Uses official high-fidelity cloud-synthesis for professional, human-like verbal counseling.
                </span>
              )}
            </p>
            
            <div className="flex gap-2 text-[9px] font-bold text-brand-text-muted uppercase tracking-widest pt-1 border-t border-brand-border/60">
              <span className={(elevenLabsConfigured || proVoiceCount < 2) ? "text-brand-primary font-black" : "text-slate-400"}>● Pro Cloud</span>
              <span className="text-slate-300">•</span>
              <span className={(!elevenLabsConfigured && proVoiceCount >= 2) ? "text-amber-600 font-black animate-pulse" : "text-slate-400"}>● Standard Offline (Unlimited)</span>
            </div>
          </div>
          
          <div className="bg-white border border-brand-border rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-xs font-black text-brand-secondary uppercase tracking-wider mb-2">
                Select Psycheal Voice Profile
              </h3>
              <p className="text-xs text-brand-text-muted font-semibold leading-relaxed">
                Choose from our high-fidelity custom voice profiles optimized for different therapeutic states.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 border-b border-brand-border pb-3">
              {(['all', 'female', 'male'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveVoiceTab(tab)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeVoiceTab === tab
                      ? 'bg-brand-primary text-white shadow-sm font-bold'
                      : 'bg-slate-50 text-brand-text-muted hover:text-brand-secondary border border-brand-border font-semibold'
                  }`}
                >
                  {tab === 'all' ? 'All (11)' : tab === 'female' ? 'Female (6)' : 'Male (5)'}
                </button>
              ))}
            </div>

            {/* Voice profiles scrollable container */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-brand-border">
              {GEMINI_VOICES.filter(
                profile => activeVoiceTab === 'all' || profile.gender === activeVoiceTab
              ).map((profile) => {
                const isSelected = model === profile.id;
                const glowColor = profile.gender === 'female' 
                  ? profile.id === 'nova' ? 'bg-amber-400' : 'bg-rose-400'
                  : 'bg-indigo-500';

                return (
                  <div 
                    key={profile.id}
                    onClick={() => {
                      if (callStatus === 'idle') setModel(profile.id);
                    }}
                    className={`p-3.5 border rounded-xl transition-all relative ${
                      callStatus !== 'idle' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                    } ${
                      isSelected 
                        ? profile.gender === 'female' 
                          ? 'border-brand-primary bg-[#eaf6ed]/40'
                          : 'border-indigo-500 bg-indigo-50/20'
                        : 'border-brand-border hover:border-brand-primary/40'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${glowColor} animate-pulse`} />
                          <h4 className="text-xs font-extrabold text-brand-secondary">{profile.name}</h4>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                            profile.gender === 'female' 
                              ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                              : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                          }`}>
                            {profile.gender}
                          </span>
                        </div>
                        <span className="block text-[10px] text-brand-primary font-bold uppercase tracking-wider">
                          {profile.tone}
                        </span>
                      </div>
                      {isSelected && (
                        <span className={`p-1 text-white rounded-full ${
                          profile.gender === 'female' ? 'bg-[#2c6e49]' : 'bg-indigo-600'
                        }`}>
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-brand-text-muted font-semibold leading-relaxed mt-2.5">
                      {profile.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Custom Auditory Tuning (Calm & Empathetic Engine) */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-brand-bg border border-brand-border rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-brand-primary animate-spin-slow" />
                  <span className="text-[10px] text-brand-secondary font-black uppercase tracking-wider">Empathetic Voice Tuning</span>
                </div>
                <span className="text-[9px] bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">Calm Modulator</span>
              </div>
              
              <div className="space-y-3">
                {/* Voice Selection Dropdown */}
                <div className="space-y-1">
                  <label className="block text-[10px] text-brand-secondary font-bold uppercase tracking-wider">
                    Select Human Voice for {GEMINI_VOICES.find(p => p.id === model)?.name || model}:
                  </label>
                  {voices.length === 0 ? (
                    <p className="text-[10px] text-brand-text-muted font-semibold">Loading system voices...</p>
                  ) : (
                    <div className="flex gap-2">
                      <select
                        value={profileVoiceBindings[model] || ''}
                        onChange={(e) => {
                          setProfileVoiceBindings(prev => ({
                            ...prev,
                            [model]: e.target.value
                          }));
                        }}
                        className="block w-full px-2.5 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-primary text-brand-secondary"
                      >
                        {voices.map((voice, idx) => (
                          <option key={idx} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </option>
                        ))}
                      </select>
                      
                      {/* Live Preview Button */}
                      <button
                        onClick={playTestPhrase}
                        className="px-3 py-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
                        title="Test selected voice"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Test Voice
                      </button>
                    </div>
                  )}
                </div>

                {/* Speed Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-brand-secondary uppercase tracking-wider">
                    <span>Mindfulness Speed (Rate):</span>
                    <span className="text-brand-primary font-bold">{voiceRate.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.55"
                    max="1.0"
                    step="0.05"
                    value={voiceRate}
                    onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-brand-text-muted font-bold uppercase tracking-widest">
                    <span>Ultra-Empathetic / Deeply Slow</span>
                    <span>Standard Pace</span>
                  </div>
                </div>

                {/* Pitch Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-brand-secondary uppercase tracking-wider">
                    <span>Soothing Pitch (Warmth):</span>
                    <span className="text-brand-primary font-bold">{voicePitch.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.25"
                    step="0.05"
                    value={voicePitch}
                    onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                    className="w-full accent-brand-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[8px] text-brand-text-muted font-bold uppercase tracking-widest">
                    <span>Deep / Calm</span>
                    <span>Airy / Gentle</span>
                  </div>
                </div>
              </div>

              {/* Informative advice */}
              <div className="p-2.5 bg-brand-primary/5 rounded-lg border border-brand-primary/10">
                <p className="text-[10px] text-brand-text-muted leading-relaxed font-semibold">
                  💡 <span className="text-brand-secondary font-bold">Pro-Tip for Maximum Naturalness:</span> Slower speech rates (<span className="font-bold">0.75x - 0.85x</span>) sound dramatically less robotic and warmer. Choose high-fidelity English voices (such as <span className="font-bold">Siri, Samantha, Aria, Jenny, or George</span>) on your device to match our high-fidelity cloud voices perfectly!
                </p>
              </div>
            </div>
          </div>

          {/* Secure Workspace Tips */}
          <div className="bg-white border border-brand-border rounded-2xl p-4 flex gap-3 items-start">
            <Info className="w-4 h-4 text-brand-primary mt-0.5 shrink-0" />
            <div className="space-y-1">
              <span className="block text-[10px] text-brand-secondary font-black uppercase tracking-wider">Premium Sandbox Notice</span>
              <p className="text-[11px] text-brand-text-muted leading-relaxed font-semibold">
                To enable continuous voice flow, allow browser mic permissions when prompt appears. Ensure your headphones are plugged in for the ultimate sensory spatial depth experience.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Immersive Voice Core Engine & Transcript */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          
          {/* Active Call UI Console Card */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative min-h-[22rem]" id="voice-call-console">
            
            {/* Soft decorative visual background wave according to chosen model */}
            <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-10 transition-all duration-1000 ${
              model === 'nova' ? 'bg-amber-400' : 'bg-indigo-500'
            }`} />

            <div className="flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-brand-primary animate-spin-slow" />
                <span className="text-[10px] text-brand-secondary font-black uppercase tracking-wider">
                  Voice Hub
                </span>
              </div>

              {callStatus === 'connected' && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  <span className="text-[10px] text-rose-700 font-bold font-mono uppercase tracking-wider">
                    {formatDuration(callDuration)}
                  </span>
                </div>
              )}
            </div>

            {/* Immersive Soundwave visual display representing speech frequency responses */}
            <div className="flex flex-col items-center justify-center py-6 relative z-10 my-auto">
              {callStatus === 'idle' ? (
                <div className="space-y-3 text-center">
                  <div className="w-20 h-20 bg-slate-50 border border-brand-border rounded-full flex items-center justify-center mx-auto text-brand-text-muted hover:text-brand-primary cursor-pointer transition-colors" onClick={handleStartCall}>
                    <PhoneCall className="w-8 h-8 text-brand-primary" />
                  </div>
                  <p className="text-xs text-brand-secondary font-extrabold">Ready to begin therapy session</p>
                  <p className="text-[10px] text-brand-text-muted font-semibold max-w-xs mx-auto">
                    Press start call to launch {GEMINI_VOICES.find(p => p.id === model)?.name || 'Psycheal Calm'} voice core.
                  </p>
                </div>
              ) : callStatus === 'connecting' ? (
                <div className="space-y-4 text-center">
                  <div className="w-20 h-20 bg-[#eaf6ed] border border-[#d2edd8] rounded-full flex items-center justify-center mx-auto text-brand-primary animate-ping">
                    <PhoneCall className="w-8 h-8" />
                  </div>
                  <p className="text-xs text-brand-primary font-black uppercase tracking-wider">Establishing Neural Link...</p>
                  <p className="text-[10px] text-brand-text-muted font-semibold">Configuring audio frequency buffers for voice synthesis.</p>
                </div>
              ) : (
                <div className="space-y-6 text-center w-full">
                  
                  {/* Dynamic CSS Waveform Visual Equalizer bars */}
                  <div className="flex justify-center items-center gap-1.5 h-16 w-full max-w-sm mx-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((bar) => {
                      // Generate varying random or model-paced animation timings
                      const animationDelay = `${(bar * 0.12).toFixed(2)}s`;
                      const animStyle = aiSpeaking 
                        ? { animation: `waveBounce 1s ease-in-out infinite alternate ${animationDelay}` }
                        : isRecording 
                          ? { animation: `waveBounce 1.5s ease-in-out infinite alternate ${animationDelay}` }
                          : { height: '6px' };
                      
                      const isFemale = GEMINI_VOICES.find(p => p.id === model)?.gender === 'female';
                      return (
                        <div
                           key={bar}
                           style={animStyle}
                           className={`w-1 rounded-full transition-all duration-300 ${
                             isFemale 
                               ? aiSpeaking ? 'bg-[#5bb374]' : isRecording ? 'bg-amber-400' : 'bg-slate-200'
                               : aiSpeaking ? 'bg-indigo-500' : isRecording ? 'bg-indigo-400' : 'bg-slate-200'
                           }`}
                        />
                      );
                    })}
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-sm font-extrabold text-brand-secondary flex items-center justify-center gap-2">
                      <span>{GEMINI_VOICES.find(p => p.id === model)?.name || 'Psycheal Calm'}</span>
                      <span className="text-[10px] font-bold text-[#2c6e49] uppercase tracking-wider">• Connected</span>
                    </p>
                    
                    {isPremiumVoice !== null && (
                      <div className="flex justify-center">
                        {isPremiumVoice ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm">
                            ✨ Psycheal High-Fidelity Voice
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-700 animate-pulse">
                            ⚠️ System Voice (Offline Limit fallback)
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-[10px] text-brand-text-muted font-bold tracking-widest uppercase">
                      {aiSpeaking 
                        ? 'AI IS SPEAKING NOW...' 
                        : isMuted 
                          ? 'YOUR MICROPHONE IS MUTED' 
                          : isRecording 
                            ? 'AI LISTENING... SPEAK NOW' 
                            : 'AI IDLE - SAY SOMETHING OR CLICK MIC'}
                    </p>
                  </div>

                </div>
              )}
            </div>

            {/* Bottom Call Controllers */}
            {callStatus === 'connected' && (
              <div className="flex items-center justify-center gap-5 pt-4 border-t border-brand-border z-10">
                
                {/* Mute Controller */}
                <button
                  onClick={toggleMute}
                  className={`p-3.5 rounded-full border transition-all cursor-pointer ${
                    isMuted 
                      ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100' 
                      : 'bg-slate-50 border-brand-border text-brand-secondary hover:bg-slate-100'
                  }`}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Hang Up End Call Button */}
                <button
                  onClick={handleEndCall}
                  className="p-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-all cursor-pointer shadow-md transform hover:scale-105"
                  title="End Counselling Call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>

                {/* Speaker Control */}
                <button
                  onClick={toggleSpeaker}
                  className={`p-3.5 rounded-full border transition-all cursor-pointer ${
                    !isSpeakerOn 
                      ? 'bg-amber-50 border-amber-200 text-amber-600' 
                      : 'bg-slate-50 border-brand-border text-brand-secondary hover:bg-slate-100'
                  }`}
                  title={isSpeakerOn ? 'Turn off text-to-speech output' : 'Turn on text-to-speech output'}
                >
                  {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>

              </div>
            )}

          </div>

          {/* Call Transcript Timeline */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 flex-1 flex flex-col justify-between overflow-hidden min-h-[16rem]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-brand-border">
              <span className="text-[10px] text-brand-secondary font-black uppercase tracking-wider">
                Counselling Output
              </span>
              <button
                onClick={() => setIsAudioOnlyMode(!isAudioOnlyMode)}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                  isAudioOnlyMode
                    ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                    : 'bg-slate-50 text-brand-text-muted border-brand-border hover:text-brand-secondary hover:border-brand-text-muted/40 font-bold'
                }`}
                title="Toggle Audio-Only mode for deeper meditation and sensory presence"
              >
                {isAudioOnlyMode ? "Audio Only: ON" : "Audio Only: OFF"}
              </button>
            </div>

            {isAudioOnlyMode ? (
              /* Beautiful Breathing/Listening Mindfulness Center Graphic */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4" id="audio-only-mindfulness-screen">
                <div className="relative flex items-center justify-center">
                  {/* Concentric pulsing circles for breathing guidance */}
                  <div className={`w-28 h-28 rounded-full border-2 border-brand-primary/25 absolute animate-ping pointer-events-none duration-1000 ${aiSpeaking ? 'opacity-40' : 'opacity-10'}`} />
                  <div className={`w-24 h-24 rounded-full border border-brand-primary/30 absolute pointer-events-none transition-transform duration-700 ${aiSpeaking ? 'scale-110 animate-pulse' : 'scale-100'}`} />
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-tr from-[#eaf6ed] to-[#d2edd8] flex items-center justify-center shadow-inner transition-all duration-500 ${aiSpeaking ? 'scale-105 rotate-12' : ''}`}>
                    <Volume2 className={`w-8 h-8 text-brand-primary transition-all duration-500 ${aiSpeaking ? 'animate-bounce scale-110' : ''}`} />
                  </div>
                </div>
                
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="text-xs font-black text-brand-secondary uppercase tracking-wider">
                    {aiSpeaking ? "Listening to Counsellor..." : isRecording ? "Counsellor is Listening..." : "Breathe & Connect"}
                  </h4>
                  <p className="text-[11px] text-brand-text-muted font-semibold leading-relaxed">
                    {aiSpeaking 
                      ? "Close your eyes, relax your shoulders, and focus entirely on the comforting, therapeutic tone of your counsellor's voice."
                      : isRecording 
                        ? "Speak freely. Share your current feelings, thoughts, or anything that's weighing on you today."
                        : "A pure audio counselling experience. No textual distractions, encouraging absolute somatic presence and calm self-reflection."}
                  </p>
                </div>
                
                {interimSpeech && (
                  <div className="w-full max-w-xs p-2.5 bg-[#eaf6ed]/40 border border-[#d2edd8]/40 border-dashed rounded-xl text-[11px] font-semibold text-[#2c6e49] animate-pulse">
                    <span className="block text-[8px] text-brand-text-muted font-bold uppercase tracking-wider mb-0.5">Capturing speech...</span>
                    "{interimSpeech}"
                  </div>
                )}
              </div>
            ) : (
              /* Message window */
              <div className="space-y-3.5 overflow-y-auto max-h-[16rem] pr-2 flex-1" id="transcript-feed">
                {transcript.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex gap-3 text-xs leading-relaxed ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className={`p-3 rounded-xl max-w-[85%] font-semibold ${
                      msg.role === 'user' 
                        ? 'bg-[#eaf6ed] text-[#2c6e49] border border-[#d2edd8]' 
                        : 'bg-slate-50 border border-brand-border text-brand-secondary'
                    }`}>
                      <span className="block text-[8px] text-brand-text-muted font-bold uppercase tracking-wider mb-1">
                        {msg.role === 'user' ? 'You' : `${GEMINI_VOICES.find(p => p.id === model)?.name || model.toUpperCase()}`}
                      </span>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
                
                {/* Interim voice speech capture placeholder */}
                {interimSpeech && (
                  <div className="flex gap-3 text-xs leading-relaxed justify-end">
                    <div className="p-3 rounded-xl max-w-[85%] font-semibold bg-[#eaf6ed]/50 text-[#2c6e49]/70 border border-[#d2edd8]/50 border-dashed animate-pulse">
                      <span className="block text-[8px] text-brand-text-muted font-bold uppercase tracking-wider mb-1">
                        Speaking...
                      </span>
                      <p>{interimSpeech}</p>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            )}

            {/* Quick manual prompt inputs if speech isn't working/available */}
            {callStatus === 'connected' && (
              <div className="pt-4 border-t border-brand-border mt-3.5 flex gap-2">
                <input
                  type="text"
                  placeholder="Type alternative text or click mic to talk..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const inputEl = e.currentTarget;
                      handleUserSpeechSubmitted(inputEl.value);
                      inputEl.value = '';
                    }
                  }}
                  className="block w-full px-3 py-2 border border-brand-border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-slate-50 text-brand-secondary"
                />
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Embedded Animations Styles inside Component to prevent index.css bloating */}
      <style>{`
        @keyframes waveBounce {
          0% { height: 6px; }
          100% { height: 48px; }
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}
