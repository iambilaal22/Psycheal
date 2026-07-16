import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Calendar, 
  Trash2, 
  Heart, 
  Plus, 
  Loader2, 
  Check, 
  ArrowLeft 
} from 'lucide-react';
import { UserProfile, JournalEntry } from '../types';

interface JournalProps {
  userProfile: UserProfile;
  journalEntries: JournalEntry[];
  onAddJournal: (entry: JournalEntry) => void;
  onDeleteJournal: (id: string) => void;
}

export default function Journal({ userProfile, journalEntries, onAddJournal, onDeleteJournal }: JournalProps) {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Form State
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [moodScore, setMoodScore] = useState<number>(7);
  const [analyzing, setAnalyzing] = useState<boolean>(false);

  const handleCreateNew = () => {
    setTitle('');
    setContent('');
    setMoodScore(7);
    setIsCreating(true);
    setSelectedEntry(null);
  };

  const handleSaveAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setAnalyzing(true);
    let aiFeedbackResponse = "Thank you for documenting your reflection. Journaling helps organize complex emotional thoughts.";

    try {
      const res = await fetch('/api/journal-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim() })
      });
      const data = await res.json();
      if (data.feedback) {
        aiFeedbackResponse = data.feedback;
      }
    } catch (err) {
      console.error("Journal server query failed:", err);
    } finally {
      setAnalyzing(false);
    }

    const newEntry: JournalEntry = {
      id: `journal_${Date.now()}`,
      title: title.trim() || `Reflection on ${new Date().toLocaleDateString()}`,
      content: content.trim(),
      date: new Date().toISOString(),
      moodScore,
      aiFeedback: aiFeedbackResponse
    };

    onAddJournal(newEntry);
    setIsCreating(false);
    setSelectedEntry(newEntry); // View details
  };

  const getMoodEmoji = (score: number) => {
    if (score >= 9) return '🌟';
    if (score >= 7) return '☀️';
    if (score >= 5) return '⛅';
    if (score >= 3) return '☁️';
    return '🌧️';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-10 space-y-8" id="journal-container">
      
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-brand-secondary font-display">AI Reflection Journal</h2>
          <p className="text-sm text-brand-text-muted font-medium mt-1">
            Express yourself freely. Let PsycHeal guide your self-discoveries.
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={handleCreateNew}
            className="py-3 px-5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 flex items-center gap-2 transition-all cursor-pointer"
            id="create-journal-btn"
          >
            <Plus className="w-4 h-4" /> New Entry
          </button>
        )}
      </header>

      {/* Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {isCreating ? (
          /* CREATE / EDITOR PANEL */
          <div className="lg:col-span-12 bg-white border border-brand-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6" id="journal-editor-panel">
            <div className="flex justify-between items-center pb-4 border-b border-brand-border">
              <button
                onClick={() => setIsCreating(false)}
                className="flex items-center gap-2 text-xs font-bold text-brand-text-muted hover:text-brand-secondary cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to History
              </button>
              <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-brand-primary font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">AI Reflective Engine Enabled</span>
            </div>

            <form onSubmit={handleSaveAndAnalyze} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-bold text-brand-secondary uppercase tracking-wider">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Evening thoughts, morning focus, after-fight release..."
                    className="w-full p-3.5 border border-brand-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary bg-slate-50"
                    id="journal-title-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-brand-secondary uppercase tracking-wider">Current Feeling: {getMoodEmoji(moodScore)} ({moodScore}/10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={moodScore}
                    onChange={(e) => setMoodScore(parseInt(e.target.value))}
                    className="w-full h-1.5 accent-brand-primary bg-slate-200 rounded-lg cursor-pointer mt-3"
                  />
                  <div className="flex justify-between text-[9px] text-brand-text-muted font-bold uppercase">
                    <span>Heavy</span>
                    <span>Neutral</span>
                    <span>Vibrant</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-brand-secondary uppercase tracking-wider">Journal Content</label>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Pour your heart and mind onto the page. Write about your day, how your body feels, your stresses, or what you feel proud of today..."
                  className="w-full p-4 border border-brand-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary bg-slate-50 leading-relaxed resize-none"
                  id="journal-content-textarea"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={analyzing || !content.trim()}
                className="py-4 px-6 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 w-full md:w-auto cursor-pointer disabled:opacity-50"
                id="journal-save-btn"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>PsycHeal is reading & generating insights...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save Entry & Generate AI Feedback</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* LIST / DETAIL VIEW */
          <>
            {/* Left Hand: Prior Entries List */}
            <div className="lg:col-span-5 space-y-4" id="journal-list-section">
              <h3 className="text-sm font-black text-brand-secondary uppercase tracking-wider px-1">My Reflections</h3>
              {journalEntries.length === 0 ? (
                <div className="bg-white border border-brand-border rounded-3xl p-8 text-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 bg-indigo-50 text-brand-primary rounded-xl flex items-center justify-center text-xl mx-auto border border-indigo-100">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-secondary">Reflection Book Empty</h4>
                    <p className="text-[10px] text-brand-text-muted leading-relaxed font-medium mt-1">
                      Writing things down creates mental space. Tap 'New Entry' above to document your first reflection today.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-160">
                  {journalEntries.map(entry => (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer block ${
                        selectedEntry?.id === entry.id
                          ? 'bg-white border-brand-primary shadow-md shadow-indigo-100/30'
                          : 'bg-white border-brand-border hover:bg-slate-50 shadow-xs'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-black text-brand-secondary truncate">{entry.title}</h4>
                        <span className="text-xs shrink-0">{getMoodEmoji(entry.moodScore)}</span>
                      </div>
                      <p className="text-[10px] text-brand-text-muted font-medium truncate mt-1">
                        {entry.content}
                      </p>
                      <div className="flex justify-between items-center mt-3 text-[9px] text-slate-400 font-bold uppercase">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        {entry.aiFeedback && (
                          <span className="text-indigo-600 flex items-center gap-0.5 font-extrabold">
                            <Sparkles className="w-3 h-3" /> Reviewed
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Hand: Deep Detail Panel */}
            <div className="lg:col-span-7 bg-white border border-brand-border rounded-3xl p-6 shadow-sm min-h-120 flex flex-col justify-between" id="journal-detail-panel">
              {selectedEntry ? (
                <div className="space-y-6">
                  {/* Title and date */}
                  <div className="flex justify-between items-start border-b border-brand-border pb-4 gap-4">
                    <div>
                      <span className="text-[9px] text-brand-text-muted font-black uppercase tracking-wider flex items-center gap-1 mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(selectedEntry.date).toLocaleString()}
                      </span>
                      <h3 className="text-base font-black text-brand-secondary">{selectedEntry.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-center bg-slate-50 border border-brand-border px-3 py-1.5 rounded-xl shrink-0">
                        <p className="text-[8px] text-brand-text-muted font-bold uppercase tracking-wider">Mood</p>
                        <p className="text-xs font-extrabold text-brand-secondary mt-0.5">{getMoodEmoji(selectedEntry.moodScore)} {selectedEntry.moodScore}/10</p>
                      </div>
                      <button
                        onClick={() => {
                          onDeleteJournal(selectedEntry.id);
                          setSelectedEntry(null);
                        }}
                        className="p-2.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">My Words</h4>
                    <p className="text-xs text-brand-text font-medium leading-relaxed bg-slate-50/50 p-4 border border-brand-border rounded-2xl whitespace-pre-wrap font-sans">
                      {selectedEntry.content}
                    </p>
                  </div>

                  {/* AI reflection feedback */}
                  {selectedEntry.aiFeedback && (
                    <div className="p-5 bg-linear-to-r from-indigo-950 to-slate-900 text-white rounded-2xl space-y-3.5 shadow-md border border-indigo-900/40 relative overflow-hidden">
                      {/* background ambient blur */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
                      
                      <div className="flex items-center gap-2 relative z-10">
                        <Sparkles className="w-4.5 h-4.5 text-indigo-300" />
                        <h4 className="text-xs font-black text-indigo-200 uppercase tracking-wider">PsycHeal AI Companion Reflection</h4>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-100 font-medium font-sans whitespace-pre-wrap relative z-10">
                        {selectedEntry.aiFeedback}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-4">
                  <div className="w-16 h-16 bg-slate-50 border border-brand-border rounded-full flex items-center justify-center text-2xl">
                    📓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-secondary">No Entry Selected</h4>
                    <p className="text-[10px] text-brand-text-muted max-w-xs font-medium leading-relaxed px-4">
                      Select an entry from your reflection book on the left to review your written words and custom therapeutic feedback.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
