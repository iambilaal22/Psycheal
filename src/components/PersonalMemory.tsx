import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Trash2, 
  Plus, 
  Database, 
  Volume2, 
  Cpu, 
  Activity, 
  CheckCircle,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface DBMemory {
  id: string;
  userId: string;
  memoryText: string;
  category: 'preference' | 'goal' | 'habit' | 'personality' | 'summary';
  strength: number;
  createdAt: string;
}

interface PersonalMemoryProps {
  userProfile: UserProfile;
}

export default function PersonalMemory({ userProfile }: PersonalMemoryProps) {
  const [memories, setMemories] = useState<DBMemory[]>([]);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<'preference' | 'goal' | 'habit'>('preference');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [status, setStatus] = useState<any>({
    elevenLabsConfigured: false,
    aiProvider: 'gemini',
    databaseType: 'JSON-File DB'
  });

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || '';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchMemoriesAndStatus = async () => {
    try {
      const headers = await getAuthHeaders();
      const memRes = await fetch('/api/memories', {
        headers: {
          'Authorization': headers['Authorization']
        }
      });
      const memData = await memRes.json();
      if (memData.success) {
        setMemories(memData.memories);
      }

      const keyRes = await fetch('/api/check-key');
      const keyData = await keyRes.json();
      setStatus({
        elevenLabsConfigured: keyData.elevenLabsConfigured,
        aiProvider: keyData.aiProvider,
        databaseType: keyData.databaseType
      });
    } catch (err) {
      console.error("Failed to load memory dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemoriesAndStatus();
  }, []);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    setAdding(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch('/api/memories', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: newText.trim(),
          category: newCategory
        })
      });
      const data = await response.json();
      if (data.success) {
        setMemories(prev => [data.memory, ...prev]);
        setNewText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`/api/memories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': headers['Authorization']
        }
      });
      const data = await response.json();
      if (data.success) {
        setMemories(prev => prev.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-brand-bg text-brand-text max-w-5xl mx-auto" id="personal-memory-view">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-brand-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Brain className="w-6 h-6 text-brand-primary animate-pulse" />
            <h1 className="text-xl font-extrabold tracking-tight text-brand-secondary font-display uppercase">
              Long-Term Personalized Memory
            </h1>
          </div>
          <p className="text-xs text-brand-text-muted font-medium">
            Inspect, register, or delete the cognitive traces PsycHeal extracts to personalize your clinical sessions.
          </p>
        </div>
        
        {/* Connection status badges */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-border bg-white text-[10px] font-bold shadow-xs">
            <Database className="w-3.5 h-3.5 text-[#2c6e49]" />
            <span>Store: <strong className="text-brand-primary">{status.databaseType}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-border bg-white text-[10px] font-bold shadow-xs">
            <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Voice: <strong className={status.elevenLabsConfigured ? "text-brand-primary" : "text-amber-500"}>
              {status.elevenLabsConfigured ? "Psycheal Signature (Cloud)" : "Psycheal Standard (Fallback)"}
            </strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-border bg-white text-[10px] font-bold shadow-xs">
            <Cpu className="w-3.5 h-3.5 text-rose-500" />
            <span>Clinical Engine: <strong className="text-brand-primary uppercase">Psycheal Core</strong></span>
          </div>
        </div>
      </div>

      {/* Tech Stack Diagram Callout */}
      <div className="bg-[#1c2124] border border-brand-border p-5 rounded-2xl relative overflow-hidden shadow-sm" id="tech-architecture-card">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Database className="w-32 h-32" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-primary" />
            <h2 className="text-xs font-black uppercase tracking-wider text-white">Active Production Architecture</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold text-slate-300">
            <div className="bg-[#121618] p-3.5 rounded-xl border border-brand-border/40">
              <span className="text-[10px] uppercase font-black text-[#5bb374] block mb-1">Voice Layer</span>
              <p className="text-white font-bold mb-1">Psycheal Studio Voice</p>
              <p className="text-[10px] leading-relaxed text-brand-text-muted">Empathetic speech synthesis with low-latency stability settings.</p>
            </div>
            <div className="bg-[#121618] p-3.5 rounded-xl border border-brand-border/40">
              <span className="text-[10px] uppercase font-black text-[#5bb374] block mb-1">Model Layer</span>
              <p className="text-white font-bold mb-1">Psycheal Clinical Reasoning</p>
              <p className="text-[10px] leading-relaxed text-brand-text-muted">Pluggable abstraction layer supporting custom open-weight Llama & Gemma models.</p>
            </div>
            <div className="bg-[#121618] p-3.5 rounded-xl border border-brand-border/40">
              <span className="text-[10px] uppercase font-black text-[#5bb374] block mb-1">Database Layer</span>
              <p className="text-white font-bold mb-1">PostgreSQL Client</p>
              <p className="text-[10px] leading-relaxed text-brand-text-muted">Maintains logs, wellness summaries, goals, and profiles robustly.</p>
            </div>
            <div className="bg-[#121618] p-3.5 rounded-xl border border-brand-border/40">
              <span className="text-[10px] uppercase font-black text-[#5bb374] block mb-1">Memory Engine</span>
              <p className="text-white font-bold mb-1">Continuous Extractor</p>
              <p className="text-[10px] leading-relaxed text-brand-text-muted">Heuristic summaries, preference, and goal consolidation injected to system prompt.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Manual Memory Insertion Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-xs" id="memory-form-card">
            <div className="flex items-center gap-2 mb-4">
              <Plus className="w-4.5 h-4.5 text-brand-primary" />
              <h2 className="text-xs font-black uppercase tracking-wider text-brand-secondary">
                Register Custom Trait
              </h2>
            </div>
            <form onSubmit={handleAddMemory} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-muted mb-1.5">
                  Cognitive Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs font-bold bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-brand-primary"
                >
                  <option value="preference">Preference (communication preference, style)</option>
                  <option value="goal">Goal (wellness objective, therapy topic)</option>
                  <option value="habit">Habit (routine, coping activity)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text-muted mb-1.5">
                  Memory Description
                </label>
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="e.g., Prefers gentle, slow paced CBT guidance and breathing routines."
                  rows={4}
                  className="w-full px-3 py-2 border border-brand-border rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-brand-primary resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={adding || !newText.trim()}
                className="w-full py-2.5 px-4 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all hover:bg-brand-primary-hover flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {adding ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                <span>Add Memory Trace</span>
              </button>
            </form>
          </div>

          {/* Guidelines info card */}
          <div className="bg-slate-50/50 border border-brand-border/80 rounded-2xl p-5 text-[11px] leading-relaxed text-brand-text-muted">
            <div className="flex items-center gap-1.5 font-bold text-brand-secondary mb-2 text-xs">
              <Info className="w-4 h-4 text-brand-primary shrink-0" />
              <span>How Memory Works</span>
            </div>
            <p className="mb-2 font-medium">
              PsycHeal's modular memory engine listens closely during your conversations.
            </p>
            <p className="font-medium">
              If you state habits, wellness targets, or specific styles (e.g. <strong className="text-brand-secondary">"I prefer short checkins"</strong>), the backend parser logs them into your long-term database profile automatically. These are loaded to guide every future message!
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Memory Trace List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Brain className="w-4.5 h-4.5 text-brand-primary" />
              <h2 className="text-xs font-black uppercase tracking-wider text-brand-secondary">
                Registered Profile Memory Traces ({memories.length})
              </h2>
            </div>
            <button 
              onClick={fetchMemoriesAndStatus}
              className="text-[10px] text-brand-primary hover:underline font-bold"
            >
              Sync Live
            </button>
          </div>

          {loading ? (
            <div className="bg-white border border-brand-border rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-2">
              <Activity className="w-6 h-6 animate-spin text-brand-primary" />
              <p className="text-xs font-bold text-brand-text-muted">Loading persistent memory traces...</p>
            </div>
          ) : memories.length === 0 ? (
            <div className="bg-white border border-brand-border rounded-2xl p-12 text-center" id="empty-memories-card">
              <Brain className="w-10 h-10 text-brand-border mx-auto mb-3" />
              <p className="text-xs font-black text-brand-secondary mb-1">No memory traces recorded yet</p>
              <p className="text-[11px] text-brand-text-muted max-w-sm mx-auto leading-relaxed">
                Start chatting with your AI companion or register manual preferences on the left to see memory consolidation in real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-3" id="memories-container-list">
              {memories.map((m) => {
                let badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-100";
                if (m.category === 'goal') badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                if (m.category === 'habit') badgeColor = "bg-amber-50 text-amber-700 border-amber-100";
                if (m.category === 'summary') badgeColor = "bg-purple-50 text-purple-700 border-purple-100";

                return (
                  <div 
                    key={m.id}
                    className="bg-white border border-brand-border rounded-xl p-4 flex items-start justify-between gap-4 transition-all hover:shadow-xs shadow-2xs"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${badgeColor}`}>
                          {m.category}
                        </span>
                        <span className="text-[9px] text-brand-text-muted font-bold font-mono">
                          Strength: {m.strength || 3}/5
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-brand-secondary leading-relaxed">
                        {m.memoryText}
                      </p>
                      <span className="text-[9px] text-brand-text-muted font-bold block">
                        Registered: {new Date(m.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteMemory(m.id)}
                      className="text-brand-text-muted hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50/50 transition-colors cursor-pointer shrink-0"
                      title="Wipe Memory Trace"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
