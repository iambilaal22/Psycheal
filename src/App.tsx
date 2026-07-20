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
import { supabase } from './lib/supabase';
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

  // Supabase auth subscription to persist separate session tokens per browser
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session) {
        setUserProfile({
          uid: session.user.id,
          email: session.user.email || '',
          nickname: session.user.user_metadata?.nickname || session.user.email?.split('@')[0] || 'Soul',
          premium: true,
          joinedAt: session.user.created_at || new Date().toISOString(),
          checkInStreak: 3,
          dailyGoalMinutes: 15
        });
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);


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

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
          <PersonalMemory userProfile={userProfile} />
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
        {renderActiveTab()}
      </main>

    </div>
  );
}
