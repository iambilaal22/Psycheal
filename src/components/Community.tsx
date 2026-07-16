import React, { useState } from 'react';
import { Users, Heart, MessageSquare, Plus, Check, Loader2, Sparkles } from 'lucide-react';
import { CommunityMessage } from '../types';

interface CommunityProps {
  userNickname: string;
  messages: CommunityMessage[];
  onAddMessage: (msg: CommunityMessage) => void;
  onHeartMessage: (id: string) => void;
}

export default function Community({ userNickname, messages, onAddMessage, onHeartMessage }: CommunityProps) {
  const [inputText, setInputText] = useState<string>('');
  const [category, setCategory] = useState<"Support" | "Gratitude" | "Reflection" | "Grounding">("Gratitude");
  const [isPosting, setIsPosting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsPosting(true);
    setTimeout(() => {
      const newMessage: CommunityMessage = {
        id: `msg_${Date.now()}`,
        authorName: `${userNickname} (Anonymous)`,
        text: inputText.trim(),
        timestamp: new Date().toISOString(),
        hearts: 0,
        category
      };

      onAddMessage(newMessage);
      setInputText('');
      setIsPosting(false);
    }, 400);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Support': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Gratitude': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Reflection': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Grounding': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-brand-bg p-6 md:p-10 space-y-8" id="community-container">
      
      {/* Header */}
      <header>
        <h2 className="text-2xl md:text-3xl font-black text-brand-secondary font-display">Safe Haven Community Board</h2>
        <p className="text-sm text-brand-text-muted font-medium mt-1">
          Share micro-messages of self-reflection, gratitude, or support, completely anonymously with other members.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Write Supportive Note */}
        <div className="lg:col-span-4 bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-5" id="community-input-card">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-brand-primary" />
            <h3 className="text-base font-extrabold text-brand-secondary">Share Warm Words</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-brand-secondary uppercase tracking-wider mb-2">Tag Your Post</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(["Support", "Gratitude", "Reflection", "Grounding"] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-2.5 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      category === cat
                        ? 'bg-[#eaf6ed] border-brand-primary text-[#2c6e49]'
                        : 'border-brand-border hover:bg-slate-50 text-brand-text-muted'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Input */}
            <div>
              <label className="block text-xs font-bold text-brand-secondary uppercase tracking-wider mb-1.5">Your Message</label>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="What gratitude did you encounter today? Or what supportive words would you like to put out into the world?"
                className="w-full p-3 border border-brand-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary bg-slate-50 leading-relaxed resize-none"
                id="community-message-input"
                maxLength={240}
                required
              />
              <div className="flex justify-between text-[9px] text-brand-text-muted font-bold mt-1 uppercase">
                <span>Maximum 240 chars</span>
                <span>{inputText.length}/240</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPosting || !inputText.trim()}
              className="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              id="community-post-btn"
            >
              {isPosting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Post Supportive Word</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Panel: Scrollable Grid of Bento Notes */}
        <div className="lg:col-span-8 space-y-4" id="community-board-section">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-black text-brand-secondary uppercase tracking-wider">Support Board</h3>
            <span className="text-[10px] bg-indigo-50 text-brand-primary font-bold px-2 py-1 rounded-full border border-indigo-100 uppercase tracking-wider">
              {messages.length} Supportive Notes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-160 overflow-y-auto pr-1">
            {messages.map(msg => (
              <div
                key={msg.id}
                className="bg-white border border-brand-border p-5 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border rounded-md ${getCategoryColor(msg.category)}`}>
                      {msg.category}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold">
                      {new Date(msg.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-brand-secondary font-medium leading-relaxed italic">
                    "{msg.text}"
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-brand-border/60 pt-3 text-[10px]">
                  <span className="font-bold text-brand-text-muted truncate">
                    — {msg.authorName}
                  </span>
                  <button
                    onClick={() => onHeartMessage(msg.id)}
                    className="flex items-center gap-1 text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 px-2.5 py-1 rounded-lg font-extrabold transition-all cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500 stroke-rose-500" />
                    <span>{msg.hearts}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
