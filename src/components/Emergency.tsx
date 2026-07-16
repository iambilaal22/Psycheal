import React from 'react';
import { AlertOctagon, Phone, ShieldAlert, Heart, Compass, ExternalLink } from 'lucide-react';

export default function Emergency() {
  const hotlines = [
    { name: "United States (988 Crisis)", number: "988", desc: "Available 24/7. National Suicide & Crisis Lifeline.", region: "USA" },
    { name: "UK (NHS / Samaritans)", number: "111", desc: "Dial 111 for mental wellness support or Samaritans at 116 123.", region: "United Kingdom" },
    { name: "Canada Crisis Line", number: "1-833-456-4566", desc: "Talk Suicide Canada. Available 24/7.", region: "Canada" },
    { name: "India (Kiran / Tele-MANAS)", number: "1800-599-0019", desc: "Available 24/7. Govt of India Mental Health Helpline. Alternate: 14416.", region: "India" },
    { name: "Australia Lifeline", number: "13 11 14", desc: "Crisis support and suicide prevention.", region: "Australia" },
    { name: "Crisis Text Line (Global)", number: "Text HOME to 741741", desc: "Connect with a volunteer crisis counselor 24/7 via SMS.", region: "Global Text" }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-10 space-y-8" id="emergency-container">
      
      {/* Safety Alert Header */}
      <div className="bg-rose-50 border-l-4 border-rose-600 p-6 rounded-3xl space-y-4 shadow-sm" id="emergency-header-alert">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-600/30">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-black text-rose-950 uppercase tracking-tight">Clinical Crisis Support & Safety Net</h2>
            <p className="text-xs text-rose-800 font-medium">Please review this safety disclaimer first.</p>
          </div>
        </div>
        
        <p className="text-xs text-rose-900 leading-relaxed font-semibold bg-white/50 p-4 border border-rose-200/50 rounded-2xl">
          <span className="font-black text-rose-950 uppercase tracking-wider block mb-1">⚠️ Safety First Disclaimer:</span>
          PsycHeal is developed as a digital self-reflection wellness platform. We are <span className="font-black underline text-rose-700">NOT a licensed clinical therapeutic agency, psychiatric medical provider, or emergency dispatch center</span>. We cannot diagnose medical conditions or dispatch first responders. If you or someone you know is in active danger or severe distress, please dial your local emergency services (e.g. 911) or call a hot crisis counseling expert listed below immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Hotlines lists bento */}
        <div className="lg:col-span-7 bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-5" id="emergency-hotlines-card">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-5 h-5 text-rose-600 animate-pulse" />
            <h3 className="text-base font-extrabold text-brand-secondary">Crisis Counseling Lines (Direct Hotlines)</h3>
          </div>

          <div className="space-y-3.5">
            {hotlines.map((hl, index) => (
              <div 
                key={index} 
                className="p-4 border border-brand-border hover:border-rose-200 hover:bg-rose-50/10 rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-slate-100 border border-slate-200 text-brand-secondary font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {hl.region}
                    </span>
                    <h4 className="text-xs font-black text-brand-secondary">{hl.name}</h4>
                  </div>
                  <p className="text-[10px] text-brand-text-muted font-medium">{hl.desc}</p>
                </div>

                <a
                  href={`tel:${hl.number.replace(/[^0-9]/g, '')}`}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-100 flex items-center justify-center gap-2 cursor-pointer inline-block text-center shrink-0"
                >
                  <Phone className="w-3.5 h-3.5" /> Call {hl.number}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Somatic Grounding Worksheets */}
        <div className="lg:col-span-5 bg-white border border-brand-border rounded-3xl p-6 shadow-sm space-y-6" id="emergency-grounding-card">
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-extrabold text-brand-secondary">Somatic Breathing & Grounding</h3>
          </div>

          <p className="text-xs text-brand-text-muted leading-relaxed font-medium">
            If racing thoughts or physical anxiety sensations feel overwhelming right now, take a brief moment to ground yourself in the physical present.
          </p>

          <div className="space-y-4 pt-2">
            {/* Somatic grounding 1 */}
            <div className="p-4 bg-slate-50 border border-brand-border rounded-2xl space-y-2">
              <h4 className="text-xs font-black text-brand-secondary uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                Somatic Box Breathing (4-4-4-4 Technique)
              </h4>
              <p className="text-[11px] text-brand-text-muted leading-relaxed font-medium font-sans">
                1. <span className="font-bold text-indigo-600">Inhale</span> slowly through your nose for 4 seconds.<br />
                2. <span className="font-bold text-indigo-600">Hold</span> your breath gently for 4 seconds.<br />
                3. <span className="font-bold text-indigo-600">Exhale</span> completely through your mouth for 4 seconds.<br />
                4. <span className="font-bold text-indigo-600">Hold</span> empty for 4 seconds. Repeat 4 times to calm your autonomic nervous system.
              </p>
            </div>

            {/* Somatic grounding 2 */}
            <div className="p-4 bg-slate-50 border border-brand-border rounded-2xl space-y-2">
              <h4 className="text-xs font-black text-brand-secondary uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                The 5-4-3-2-1 Sensory Reset
              </h4>
              <p className="text-[11px] text-brand-text-muted leading-relaxed font-medium font-sans">
                Look around your immediate space and name:<br />
                👁️ <span className="font-bold text-brand-secondary">5 THINGS</span> you can see (e.g., a chair, a shadow)<br />
                🖐️ <span className="font-bold text-brand-secondary">4 THINGS</span> you can feel physically (e.g., your shirt, your socks)<br />
                👂 <span className="font-bold text-brand-secondary">3 THINGS</span> you can hear (e.g., the AC breeze, distant cars)<br />
                👃 <span className="font-bold text-brand-secondary">2 THINGS</span> you can smell (e.g., coffee, wood, clean air)<br />
                👅 <span className="font-bold text-brand-secondary">1 THING</span> you can taste (e.g., mint, water, tea)
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
