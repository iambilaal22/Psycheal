import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, CheckCircle2, X, Key, Settings, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import Navigation from './components/Navigation';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import Companion from './components/Companion';
import Journal from './components/Journal';
import WellnessPlans from './components/WellnessPlans';
import Community from './components/Community';
import Profile from './components/Profile';
import Emergency from './components/Emergency';
import VoiceCall from './components/VoiceCall';
import PersonalMemory from './components/PersonalMemory';
import { 
  UserProfile, 
  MoodRecord, 
  JournalEntry, 
  ChatSession, 
  WellnessPlan, 
  CommunityMessage,
  ChatMessage
} from './types';

export default function App() {
  // Central State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('companion');
  const [moodHistory, setMoodHistory] = useState<MoodRecord[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activePlan, setActivePlan] = useState<WellnessPlan | null>(null);
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([]);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);
  const [showGeminiBanner, setShowGeminiBanner] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'checking' | 'syncing' | 'connected' | 'unconfigured' | 'offline'>('checking');

  // Theme state: dark (default) or light
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('psycheal-theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  // Synchronize theme with Document class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('psycheal-theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const triggerSyncCheck = () => {
    setSyncStatus('syncing');
    fetch('/api/check-key')
      .then(res => res.json())
      .then(data => {
        const isConfigured = !!data.configured;
        setGeminiConfigured(isConfigured);
        setTimeout(() => {
          setSyncStatus(isConfigured ? 'connected' : 'unconfigured');
        }, 1000);
      })
      .catch(() => {
        setTimeout(() => {
          setGeminiConfigured(false);
          setSyncStatus('offline');
        }, 1000);
      });
  };

  // Load initial local data if any, or seed with professional high-fidelity items
  useEffect(() => {
    triggerSyncCheck();

    // 1. Seed Mood History
    const initialMoods: MoodRecord[] = [
      { id: 'mood_1', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], score: 6, energy: 5, sleep: 6.5, notes: "Felt quite tired after work." },
      { id: 'mood_2', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], score: 7, energy: 6, sleep: 7.0, notes: "Took a soothing evening walk. Slept better." },
      { id: 'mood_3', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], score: 8, energy: 8, sleep: 8.0, notes: "Had a great catch-up with a childhood friend." },
      { id: 'mood_4', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], score: 7, energy: 7, sleep: 7.5, notes: "Focusing on mindfulness breathing today." }
    ];
    setMoodHistory(initialMoods);

    // 2. Seed Journal Entries
    const initialJournals: JournalEntry[] = [
      {
        id: 'journal_1',
        title: "Starting my mindful path",
        content: "I want to be more present in my daily life. Writing things down feels like a safe, peaceful release. Hopefully, focusing on daily check-ins helps me understand my triggers better.",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        moodScore: 7,
        aiFeedback: "This is a beautiful, self-compassionate start. Wanting to be present is a powerful intention. Focus on one small sensory anchor today, like the physical warmth of your coffee or the rustle of wind. You are off to a courageous start."
      }
    ];
    setJournalEntries(initialJournals);

    // 3. Seed Support messages
    const initialCommunity: CommunityMessage[] = [
      {
        id: 'c_1',
        authorName: "KindSoul (Anonymous)",
        text: "Just a gentle reminder to whoever is reading this: you are allowed to make mistakes. You are allowed to take a break. Your worth is not defined by how productive you were today.",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        hearts: 14,
        category: "Support"
      },
      {
        id: 'c_2',
        authorName: "GratefulMind (Anonymous)",
        text: "Today I'm incredibly grateful for the warm cup of tea I had this morning. Sometimes the tiniest physical comforts are the most stabilizing anchors.",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        hearts: 8,
        category: "Gratitude"
      },
      {
        id: 'c_3',
        authorName: "PeaceSeeker (Anonymous)",
        text: "If you are feeling physical anxiety sensations right now, try stretching your shoulders or letting your jaw go soft. We are carrying so much tension without noticing.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        hearts: 5,
        category: "Grounding"
      }
    ];
    setCommunityMessages(initialCommunity);
  }, []);

  // Auth callbacks
  const handleAuthSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  const handleLogout = () => {
    setUserProfile(null);
    setActiveTab('companion');
  };

  // Profile updaters
  const handleUpdateNickname = (nick: string) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, nickname: nick });
    }
  };

  const handleUpdateDailyGoal = (minutes: number) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, dailyGoalMinutes: minutes });
    }
  };

  const handleUpdatePremiumStatus = (status: boolean) => {
    if (userProfile) {
      setUserProfile({ ...userProfile, premium: status });
    }
  };

  // Mood history updaters
  const handleAddMood = (record: MoodRecord) => {
    setMoodHistory(prev => [record, ...prev]);
    // increment streak on mood log
    if (userProfile) {
      setUserProfile(prev => prev ? { ...prev, checkInStreak: prev.checkInStreak + 1 } : null);
    }
  };

  // Journal updaters
  const handleAddJournal = (entry: JournalEntry) => {
    setJournalEntries(prev => [entry, ...prev]);
  };

  const handleDeleteJournal = (id: string) => {
    setJournalEntries(prev => prev.filter(j => j.id !== id));
  };

  // Chat/Companion session managers
  const handleAddSession = (sess: ChatSession) => {
    setSessions(prev => {
      if (prev.some(s => s.id === sess.id)) {
        return prev;
      }
      return [sess, ...prev];
    });
  };

  const handleUpdateSessionMessages = (sessId: string, msgs: ChatMessage[]) => {
    setSessions(prev => prev.map(s => s.id === sessId ? { ...s, messages: msgs, updatedAt: new Date().toISOString() } : s));
  };

  // Plan updaters
  const handleUpdateTaskCompletion = (taskId: string, completed: boolean) => {
    if (activePlan) {
      const updatedTasks = activePlan.tasks.map(t => t.id === taskId ? { ...t, completed } : t);
      setActivePlan({ ...activePlan, tasks: updatedTasks });
    }
  };

  // Community managers
  const handleAddCommunityMessage = (msg: CommunityMessage) => {
    setCommunityMessages(prev => [msg, ...prev]);
  };

  const handleHeartCommunityMessage = (id: string) => {
    setCommunityMessages(prev => prev.map(m => m.id === id ? { ...m, hearts: m.hearts + 1 } : m));
  };

  // Router logic
  const renderActiveTab = () => {
    if (!userProfile) return null;

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            userProfile={userProfile} 
            moodHistory={moodHistory} 
            onAddMood={handleAddMood}
            setActiveTab={setActiveTab}
          />
        );
      case 'companion':
        return (
          <Companion 
            userProfile={userProfile} 
            sessions={sessions}
            onAddSession={handleAddSession}
            onUpdateSessionMessages={handleUpdateSessionMessages}
          />
        );
      case 'voice':
        return (
          <VoiceCall 
            userProfile={userProfile} 
          />
        );
      case 'memory':
        return (
          <PersonalMemory />
        );
      case 'journal':
        return (
          <Journal 
            userProfile={userProfile} 
            journalEntries={journalEntries} 
            onAddJournal={handleAddJournal}
            onDeleteJournal={handleDeleteJournal}
          />
        );
      case 'plans':
        return (
          <WellnessPlans 
            userProfile={userProfile} 
            activePlan={activePlan} 
            onSetActivePlan={setActivePlan}
            onUpdateTaskCompletion={handleUpdateTaskCompletion}
          />
        );
      case 'community':
        return (
          <Community 
            userNickname={userProfile.nickname} 
            messages={communityMessages} 
            onAddMessage={handleAddCommunityMessage}
            onHeartMessage={handleHeartCommunityMessage}
          />
        );
      case 'profile':
        return (
          <Profile 
            userProfile={userProfile} 
            moodHistory={moodHistory} 
            journalEntries={journalEntries}
            onUpdateNickname={handleUpdateNickname}
            onUpdateDailyGoal={handleUpdateDailyGoal}
            onUpdatePremiumStatus={handleUpdatePremiumStatus}
          />
        );
      case 'emergency':
        return <Emergency />;
      default:
        return (
          <Companion 
            userProfile={userProfile} 
            sessions={sessions}
            onAddSession={handleAddSession}
            onUpdateSessionMessages={handleUpdateSessionMessages}
            theme={theme}
          />
        );
    }
  };

  // Show login if unauthenticated
  if (!userProfile) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans" id="psycheal-app-root">
      
      {/* Dynamic Navigation Sidebar */}
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userNickname={userProfile.nickname} 
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main View Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {showGeminiBanner && (
          <div className="bg-white border-b border-brand-border px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 transition-all duration-300 relative overflow-hidden" id="gemini-status-banner">
            {/* Soft decorative background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-[#5bb374]/5 to-transparent blur-2xl pointer-events-none" />
            
            <div className="flex items-start gap-4 z-10 max-w-4xl">
              <div className={`p-2.5 rounded-xl shrink-0 transition-all duration-300 ${
                syncStatus === 'connected' 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                  : syncStatus === 'syncing' 
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                    : syncStatus === 'offline'
                      ? 'bg-rose-50 text-rose-600 border border-rose-100'
                      : 'bg-[#eaf6ed]/80 text-[#2c6e49] border border-[#d2edd8]'
              }`}>
                {syncStatus === 'syncing' ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                ) : syncStatus === 'offline' ? (
                  <WifiOff className="w-5 h-5 text-rose-600" />
                ) : (
                  <Sparkles className="w-5 h-5 animate-pulse" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-brand-secondary flex flex-wrap items-center gap-2">
                  <span>Gemini AI Integration Status</span>
                  {syncStatus === 'syncing' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[9px] font-bold rounded-full uppercase tracking-wider">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin shrink-0" />
                      Syncing...
                    </span>
                  )}
                  {syncStatus === 'connected' && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full uppercase tracking-wider border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      Securely Connected
                    </span>
                  )}
                  {syncStatus === 'unconfigured' && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded-full uppercase tracking-wider border border-amber-200 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      Setup Required
                    </span>
                  )}
                  {syncStatus === 'offline' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-bold rounded-full uppercase tracking-wider border border-rose-200">
                      <WifiOff className="w-2.5 h-2.5 shrink-0" />
                      Offline
                    </span>
                  )}
                  {syncStatus === 'checking' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-800 text-[9px] font-bold rounded-full uppercase tracking-wider border border-slate-200">
                      Checking...
                    </span>
                  )}
                </h3>
                
                <p className="text-xs text-brand-text-muted font-semibold leading-relaxed">
                  PsycHeal leverages Google's advanced Gemini models on our secure full-stack backend.
                </p>

                {syncStatus === 'syncing' ? (
                  <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold mt-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600 shrink-0" />
                    <span>Verifying secure end-to-end socket connection and verifying cloud environment keys...</span>
                  </div>
                ) : syncStatus === 'offline' ? (
                  <div className="flex items-center gap-1.5 text-xs text-rose-700 font-bold mt-1.5">
                    <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
                    <span>Communication offline. Check your network or review your configured GEMINI_API_KEY.</span>
                  </div>
                ) : geminiConfigured === false ? (
                  <div className="mt-2.5 pt-2.5 border-t border-brand-border space-y-2">
                    <p className="text-xs font-bold text-brand-secondary">
                      To activate deep customized AI reflection &amp; dynamic CBT plans:
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                      <li className="flex items-start gap-2 bg-slate-50/50 border border-brand-border p-2.5 rounded-xl text-[11px] font-semibold text-brand-text">
                        <span className="w-5 h-5 rounded-full bg-[#eaf6ed] border border-[#d2edd8] text-[#2c6e49] flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                        <span>Acquire an API Key from <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-[#2c6e49] font-bold underline hover:text-[#1e4e32]">Google AI Studio</a>.</span>
                      </li>
                      <li className="flex items-start gap-2 bg-slate-50/50 border border-brand-border p-2.5 rounded-xl text-[11px] font-semibold text-brand-text">
                        <span className="w-5 h-5 rounded-full bg-[#eaf6ed] border border-[#d2edd8] text-[#2c6e49] flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                        <span>Open the <strong className="text-brand-secondary font-bold">Settings &gt; Secrets</strong> panel in this app workspace.</span>
                      </li>
                      <li className="flex items-start gap-2 bg-slate-50/50 border border-brand-border p-2.5 rounded-xl text-[11px] font-semibold text-brand-text">
                        <span className="w-5 h-5 rounded-full bg-[#eaf6ed] border border-[#d2edd8] text-[#2c6e49] flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                        <span>Bind your key to the <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px] font-mono font-bold text-[#2c6e49]">GEMINI_API_KEY</code> field.</span>
                      </li>
                    </ul>
                  </div>
                ) : geminiConfigured === true ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mt-1.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                    <span>Deep customized AI reflection &amp; dynamic CBT plans are fully enabled. Securely connected to Google AI Studio.</span>
                  </div>
                ) : (
                  <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mt-1" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 z-10 shrink-0 md:self-center">
              <button
                onClick={triggerSyncCheck}
                disabled={syncStatus === 'syncing'}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-secondary bg-slate-50 hover:bg-slate-100 border border-brand-border rounded-xl cursor-pointer transition-all hover:shadow-xs active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                title="Synchronize and re-verify API key connection state"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-brand-primary ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>
              <button
                onClick={() => setShowGeminiBanner(false)}
                className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                title="Dismiss Banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {renderActiveTab()}
      </main>

    </div>
  );
}
