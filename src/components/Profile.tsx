import React, { useState } from 'react';
import { UserCircle2, ShieldCheck, Download, Check, Sparkles, Key, AlertCircle, Info, Heart } from 'lucide-react';
import { UserProfile, MoodRecord, JournalEntry } from '../types';

interface ProfileProps {
  userProfile: UserProfile;
  moodHistory: MoodRecord[];
  journalEntries: JournalEntry[];
  onUpdateNickname: (nick: string) => void;
  onUpdateDailyGoal: (minutes: number) => void;
  onUpdatePremiumStatus: (status: boolean) => void;
}

export default function Profile({ 
  userProfile, 
  moodHistory, 
  journalEntries, 
  onUpdateNickname, 
  onUpdateDailyGoal, 
  onUpdatePremiumStatus 
}: ProfileProps) {
  const [nick, setNick] = useState<string>(userProfile.nickname);
  const [goal, setGoal] = useState<number>(userProfile.dailyGoalMinutes);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nick.trim()) return;

    onUpdateNickname(nick.trim());
    onUpdateDailyGoal(goal);
    setSuccessMsg('Your wellness parameters have been updated.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleExportData = () => {
    const exportPayload = {
      profile: userProfile,
      moodLogs: moodHistory,
      journals: journalEntries,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `psycheal_wellness_profile_${userProfile.uid}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-10 space-y-8" id="profile-container">
      
      {/* Header */}
      <header>
        <h2 className="text-2xl md:text-3xl font-black text-brand-secondary font-display">Profile & Psychological Insights</h2>
        <p className="text-sm text-brand-text-muted font-medium mt-1">
          Review your self-reflection metrics, download your history, or adapt your clinical safe parameters.
        </p>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form Panel: Profile Adjustments */}
        <div className="lg:col-span-6 bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-5" id="profile-settings-card">
          <div className="flex items-center gap-2 mb-2">
            <UserCircle2 className="w-5 h-5 text-brand-primary" />
            <h3 className="text-base font-extrabold text-brand-secondary">My Wellness Identity</h3>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Email Address (Disabled) */}
            <div>
              <label className="block text-xs font-bold text-brand-secondary uppercase tracking-wider mb-2">Account Email</label>
              <input
                type="text"
                disabled
                value={userProfile.email}
                className="w-full p-3.5 border border-brand-border rounded-xl text-xs font-semibold bg-slate-100 text-brand-text-muted cursor-not-allowed"
              />
            </div>

            {/* Nickname Input */}
            <div>
              <label className="block text-xs font-bold text-brand-secondary uppercase tracking-wider mb-2">Nickname (Addressed by AI)</label>
              <input
                type="text"
                value={nick}
                onChange={(e) => setNick(e.target.value)}
                className="w-full p-3.5 border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary bg-slate-50"
                id="profile-nickname-input"
                required
              />
            </div>

            {/* Daily Goal Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-brand-secondary uppercase tracking-wider">Daily Grounding Goal: {goal} Minutes</label>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={goal}
                onChange={(e) => setGoal(parseInt(e.target.value))}
                className="w-full h-1.5 accent-indigo-600 bg-slate-200 rounded-lg cursor-pointer mt-3"
              />
              <div className="flex justify-between text-[9px] text-brand-text-muted font-bold mt-1 uppercase">
                <span>5 Mins</span>
                <span>30 Mins</span>
                <span>1 Hour</span>
              </div>
            </div>

            {/* Premium status simulator */}
            <div className="flex items-center justify-between p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl">
              <div className="flex items-start gap-2.5">
                <Heart className="w-4 h-4 text-indigo-600 mt-0.5" />
                <div>
                  <span className="block text-xs font-bold text-indigo-950">Active Premium Status</span>
                  <span className="block text-[10px] text-indigo-700 font-medium">Toggle subscription simulations below</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={userProfile.premium}
                onChange={(e) => onUpdatePremiumStatus(e.target.checked)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                id="profile-premium-checkbox"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              id="profile-save-btn"
            >
              Save Parameters
            </button>
          </form>
        </div>

        {/* Right Panel: Data exporter & API Secrets Checklist */}
        <div className="lg:col-span-6 space-y-6" id="profile-right-section">
          
          {/* Data privacy & Exporter */}
          <div className="bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-4" id="profile-export-card">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-extrabold text-brand-secondary">Data Export & Portability</h3>
            </div>
            
            <p className="text-xs text-brand-text-muted leading-relaxed font-medium">
              We highly respect your data privacy. All logs and entries are preserved securely and can be downloaded anytime for your personal offline therapeutic journals.
            </p>

            <button
              onClick={handleExportData}
              className="w-full py-3.5 border border-emerald-200 hover:bg-emerald-50/50 text-emerald-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              id="profile-export-btn"
            >
              <Download className="w-4.5 h-4.5" /> Download Full History (JSON)
            </button>
          </div>

          {/* Secrets guide panel */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-md space-y-4" id="profile-secrets-card">
            <div className="flex items-center gap-2 mb-1">
              <Key className="w-5 h-5 text-indigo-300" />
              <h3 className="text-sm font-black uppercase tracking-wider text-indigo-200">API Key configuration</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              PsycHeal leverages advanced clinical reasoning models on our secure full-stack backend.
            </p>

            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-[11px] space-y-2 text-slate-400 font-semibold leading-relaxed">
              <p className="text-white font-extrabold">To activate deep customized AI reflection & dynamic CBT plans:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Acquire a standard reasoning developer API Key.</li>
                <li>Open the <span className="text-indigo-400 font-bold">Settings &gt; Secrets</span> panel in this app workspace.</li>
                <li>Bind your key to the <span className="text-indigo-400 font-bold">GEMINI_API_KEY</span> field.</li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
