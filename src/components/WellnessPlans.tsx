import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Check, 
  Plus, 
  Loader2, 
  AlertCircle, 
  HelpCircle, 
  BookOpen, 
  TrendingUp, 
  Flame 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, WellnessPlan, WellnessTask } from '../types';

interface WellnessPlansProps {
  userProfile: UserProfile;
  activePlan: WellnessPlan | null;
  onSetActivePlan: (plan: WellnessPlan | null) => void;
  onUpdateTaskCompletion: (taskId: string, completed: boolean) => void;
}

export default function WellnessPlans({ userProfile, activePlan, onSetActivePlan, onUpdateTaskCompletion }: WellnessPlansProps) {
  const [category, setCategory] = useState<"Mindfulness" | "CBT" | "Anxiety Grounding" | "Self-Reflection">("CBT");
  const [feelings, setFeelings] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feelings.trim()) {
      setError("Please describe your current state so we can customize your cognitive plan.");
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, currentFeelings: feelings.trim() })
      });
      const data = await res.json();

      if (data.title && data.tasks) {
        const newPlan: WellnessPlan = {
          id: `plan_${Date.now()}`,
          title: data.title,
          description: data.description,
          category,
          durationDays: 5,
          isActive: true,
          createdAt: new Date().toISOString(),
          tasks: data.tasks
        };
        onSetActivePlan(newPlan);
        setFeelings('');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        setError("We couldn't structure your plan. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Plan generation encountered a connection difficulty. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleTaskToggle = (taskId: string, currentCompleted: boolean) => {
    onUpdateTaskCompletion(taskId, !currentCompleted);
    
    // Trigger confetti on full plan completion
    if (!currentCompleted && activePlan) {
      const remainingUncompleted = activePlan.tasks.filter(t => t.id !== taskId && !t.completed);
      if (remainingUncompleted.length === 0) {
        confetti({
          particleCount: 150,
          spread: 80,
          colors: ['#4f46e5', '#10b981', '#3b82f6']
        });
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-brand-bg p-6 md:p-10 space-y-8" id="plans-container">
      
      {/* Header */}
      <header>
        <h2 className="text-2xl md:text-3xl font-black text-brand-secondary font-display">Personalized Wellness Journeys</h2>
        <p className="text-sm text-brand-text-muted font-medium mt-1">
          Combine CBT, somatic grounding, and deep focus habits into actionable daily steps.
        </p>
      </header>

      {/* Main body content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Create / Input Panel */}
        <div className="lg:col-span-5 bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-6" id="plans-generation-card">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-brand-primary" />
            <h3 className="text-base font-extrabold text-brand-secondary">Generate Custom AI Journey</h3>
          </div>

          <form onSubmit={handleGeneratePlan} className="space-y-5">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-bold">
                {error}
              </div>
            )}

            {/* Plan Category Select */}
            <div>
              <label className="block text-xs font-bold text-brand-secondary uppercase tracking-wider mb-2">Plan Specialty</label>
              <div className="grid grid-cols-2 gap-2">
                {(["CBT", "Mindfulness", "Anxiety Grounding", "Self-Reflection"] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-3.5 border rounded-xl text-xs font-black transition-all cursor-pointer ${
                      category === cat
                        ? 'bg-[#eaf6ed] border-brand-primary text-[#2c6e49] shadow-xs'
                        : 'border-brand-border hover:bg-slate-50 text-brand-text-muted'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Feelings State Input */}
            <div>
              <label className="block text-xs font-bold text-brand-secondary uppercase tracking-wider mb-1.5">How have you been feeling lately?</label>
              <textarea
                rows={4}
                value={feelings}
                onChange={(e) => setFeelings(e.target.value)}
                placeholder="Describe your current mental state, work pressure, relationship feelings, or anxiety in a few sentences..."
                className="w-full p-4 border border-brand-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-primary bg-slate-50 leading-relaxed resize-none"
                id="plans-feelings-input"
                required
              />
              <span className="text-[9px] text-brand-text-muted font-bold block mt-1 uppercase tracking-wider">
                We'll construct a structured, step-by-step cognitive itinerary for you.
              </span>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full py-4 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              id="plans-generate-submit-btn"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Wellness Science...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5" />
                  <span>Construct 5-Day Plan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Active Plan detail workspace */}
        <div className="lg:col-span-7 bg-white border border-brand-border rounded-3xl p-6 shadow-sm min-h-120 flex flex-col justify-between" id="plans-active-card">
          {activePlan ? (
            <div className="space-y-6">
              
              {/* Plan Title & Metadata */}
              <div className="border-b border-brand-border pb-4 flex justify-between items-start gap-4">
                <div>
                  <span className="text-[9px] bg-indigo-50 text-brand-primary font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-indigo-100">
                    {activePlan.category} specialty
                  </span>
                  <h3 className="text-lg font-black text-brand-secondary mt-2.5">{activePlan.title}</h3>
                </div>
                <button
                  onClick={() => onSetActivePlan(null)}
                  className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                >
                  Discard Journey
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-brand-text-muted font-medium leading-relaxed italic bg-slate-50 p-4 border border-brand-border rounded-2xl">
                "{activePlan.description}"
              </p>

              {/* Task list with interactive checklist */}
              <div className="space-y-3">
                <h4 className="text-[10px] text-brand-secondary font-black uppercase tracking-wider mb-2">5-Day Action Steps</h4>
                {activePlan.tasks.map((task, index) => (
                  <button
                    key={task.id}
                    onClick={() => handleTaskToggle(task.id, task.completed)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer block ${
                      task.completed
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                        : 'bg-white border-brand-border hover:bg-slate-50 text-brand-secondary'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                      task.completed
                        ? 'bg-emerald-500 border-emerald-600 text-white'
                        : 'border-slate-300 bg-slate-50'
                    }`}>
                      {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider opacity-60">Day {index + 1}</p>
                      <p className={`text-xs font-bold leading-normal mt-0.5 ${task.completed ? 'line-through opacity-70' : ''}`}>
                        {task.title}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Completion percentage and congratulatory status */}
              <div className="pt-4 border-t border-brand-border flex justify-between items-center text-xs font-bold text-brand-secondary">
                <span>Progress</span>
                <span>
                  {activePlan.tasks.filter(t => t.completed).length} / {activePlan.tasks.length} Completed
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${(activePlan.tasks.filter(t => t.completed).length / activePlan.tasks.length) * 100}%` }}
                />
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-4">
              <div className="w-16 h-16 bg-slate-50 border border-brand-border rounded-full flex items-center justify-center text-2xl shadow-inner">
                🌱
              </div>
              <div>
                <h4 className="text-xs font-bold text-brand-secondary">No Active Wellness Journey</h4>
                <p className="text-[10px] text-brand-text-muted max-w-xs font-medium leading-relaxed px-4">
                  Select a plan specialty and specify your current feelings on the left to synthesize a customized 5-day Cognitive Behavioral plan.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
