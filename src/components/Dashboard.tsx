import React, { useState } from 'react';
import { 
  Smile, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  MessageSquare,
  BookOpen,
  Info,
  ChevronDown,
  Plus,
  X,
  Zap,
  Moon,
  ChevronRight,
  Globe,
  Briefcase
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { UserProfile, MoodRecord } from '../types';

interface DashboardProps {
  userProfile: UserProfile;
  moodHistory: MoodRecord[];
  onAddMood: (record: MoodRecord) => void;
  setActiveTab: (tab: string) => void;
}

export default function Dashboard({ userProfile, moodHistory, onAddMood, setActiveTab }: DashboardProps) {
  // Modal / Logger State
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [moodScore, setMoodScore] = useState<number>(7);
  const [energyLevel, setEnergyLevel] = useState<number>(7);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [notes, setNotes] = useState<string>('');
  const [loggedToday, setLoggedToday] = useState<boolean>(false);

  // Dropdown States for Filters
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [countryFilter, setCountryFilter] = useState('All Countries');
  
  // Metric Details Modal State
  const [selectedMetric, setSelectedMetric] = useState<{
    title: string;
    category: string;
    status: string;
    desc: string;
    tips: string[];
    action: string;
    tabTarget: string;
  } | null>(null);

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: MoodRecord = {
      id: `mood_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      score: moodScore,
      energy: energyLevel,
      sleep: sleepHours,
      notes: notes.trim()
    };
    onAddMood(newRecord);
    setLoggedToday(true);
    setNotes('');
    setIsCheckInOpen(false);
  };

  // Compute average score from logs or default to 7.5
  const averageMood = moodHistory.length > 0 
    ? moodHistory.reduce((acc, m) => acc + m.score, 0) / moodHistory.length 
    : 7.5;
  const computedScore = Math.round(averageMood * 10);

  // Score description tag
  const getScoreTag = (score: number) => {
    if (score >= 85) return "Exceptional";
    if (score >= 70) return "Above average";
    if (score >= 50) return "Average";
    return "Attention Recommended";
  };

  // Generate dynamic 12-month progress tracking data matching the mockup layout but integrating live calculations
  const progressData = [
    { name: 'Jan', Score: 64 },
    { name: 'Feb', Score: 60 },
    { name: 'Mar', Score: 52 },
    { name: 'Apr', Score: 65 },
    { name: 'May', Score: 70 },
    { name: 'Jun', Score: 70 },
    { name: 'Jul', Score: 72 },
    { name: 'Aug', Score: 71 },
    { name: 'Sep', Score: 75 },
    { name: 'Oct', Score: 85 },
    { name: 'Nov', Score: 78 },
    { name: 'Dec', Score: computedScore }
  ];

  // SVG Gauge Geometry
  const gaugeRadius = 70;
  const gaugeCircumference = Math.PI * gaugeRadius; // ~219.9
  // Range is from 40 to 100 on the visual gauge
  // Map computed score (0 to 100) to gauge percentage fill
  const minGaugeValue = 40;
  const maxGaugeValue = 100;
  // Normalize score between 40 and 100 for the fill
  const scoreInGaugeRange = Math.max(minGaugeValue, Math.min(maxGaugeValue, computedScore));
  const fillPercentage = (scoreInGaugeRange - minGaugeValue) / (maxGaugeValue - minGaugeValue);
  const strokeDashoffset = gaugeCircumference * (1 - fillPercentage);

  // Map score to angle for needle pointer (180 deg to 0 deg)
  const needleAngleRad = Math.PI * (1 - fillPercentage);
  const needleX = 100 + 60 * Math.cos(needleAngleRad);
  const needleY = 100 - 60 * Math.sin(needleAngleRad);

  const getMoodEmoji = (score: number) => {
    if (score >= 9) return '🌟';
    if (score >= 7) return '☀️';
    if (score >= 5) return '⛅';
    if (score >= 3) return '☁️';
    return '🌧️';
  };

  // Metric details data for click triggers
  const metricDetails = {
    Belonging: {
      title: "Belonging",
      category: "SOCIAL NEEDS",
      status: "HIGH",
      desc: "Measures social connectivity, support networks, and psychological safety in community contexts. High belonging scores correspond directly to reduced stress and greater emotional stability.",
      tips: [
        "Share a word of encouragement or self-reflection on the anonymous Community Board.",
        "Schedule a brief micro-connection break with a trusted friend or colleague.",
        "Acknowledge one person's impact on your daily life today."
      ],
      action: "Share on Community Board",
      tabTarget: "community"
    },
    Trust: {
      title: "Trust",
      category: "FOUNDATIONAL NEEDS",
      status: "ABOVE AVERAGE",
      desc: "Measures feelings of reliability, alignment with surrounding structures, and open vulnerability. Trust forms the safety foundation for active cognitive recovery and anxiety relief.",
      tips: [
        "Engage with our AI Counselling companion to safely release guarded feelings.",
        "Review your clinical safety parameters in your profile.",
        "Practice an honest, unedited journal entry to build vulnerability with your own thoughts."
      ],
      action: "Start Counselling Session",
      tabTarget: "companion"
    },
    Energy: {
      title: "Energy",
      category: "GROWTH NEEDS",
      status: "AVERAGE",
      desc: "Tracks somatic battery, cognitive fatigue, and recovery patterns. Based on sleep data, energy levels often dip during peak stressful workloads.",
      tips: [
        "Follow a 5-minute somatic grounding breathing exercise from our Resources library.",
        "Aim for a consistent 7.5 hours of sleep, avoiding screens 30 minutes before bed.",
        "Take a short mindful outdoor stroll to refresh physical oxygen flow."
      ],
      action: "Explore Somatic Resources",
      tabTarget: "plans"
    },
    Happiness: {
      title: "Happiness",
      category: "WELLBEING OUTCOMES",
      status: "HIGH",
      desc: "A core reflection of frequent moments of presence, gratitude, and low emotional distress.",
      tips: [
        "Log a mood entry reflecting on small wins to persist your upward trajectory.",
        "Utilize the gratitude prompts in the AI Journal to reinforce cognitive restructuring.",
        "Immerse yourself in peaceful acoustic background states during focus sessions."
      ],
      action: "Write in Reflection Journal",
      tabTarget: "journal"
    },
    Purpose: {
      title: "Purpose",
      category: "WELLBEING OUTCOMES",
      status: "ABOVE AVERAGE",
      desc: "Tracks the perception of direction, structural alignment, and meaningful day-to-day engagement.",
      tips: [
        "Set an actionable, bite-sized therapeutic goal on your personalized Wellness Journeys.",
        "Connect your daily habits directly with your core values.",
        "Write a summary of your personal milestones inside the profile workspace."
      ],
      action: "Review Wellness Journeys",
      tabTarget: "plans"
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-brand-bg p-6 md:p-10 space-y-8" id="dashboard-container">
      
      {/* Top Header section matching mockup style */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-brand-secondary font-display tracking-tight">
            Wellbeing Insights
          </h2>
          <p className="text-[11px] text-brand-text-muted font-bold mt-1 uppercase tracking-widest">
            Corporate & Personal Alignment Dashboard
          </p>
        </div>

        {/* Dynamic Interactive Filters and Check-In Action Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Department Filter Selector */}
          <div className="relative group shrink-0">
            <select 
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="appearance-none bg-white border border-brand-border text-brand-secondary text-[11px] font-bold px-3 py-2 pr-8 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-primary/40 focus:border-brand-primary"
            >
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Marketing & Sales</option>
              <option>Human Resources</option>
              <option>Product & Design</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-brand-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Country Filter Selector */}
          <div className="relative group shrink-0">
            <select 
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="appearance-none bg-white border border-brand-border text-brand-secondary text-[11px] font-bold px-3 py-2 pr-8 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand-primary/40 focus:border-brand-primary"
            >
              <option>All Countries</option>
              <option>Switzerland</option>
              <option>Germany</option>
              <option>United States</option>
              <option>United Kingdom</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-brand-text-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Floating Logger Trigger Action Button */}
          <button
            onClick={() => setIsCheckInOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-lg text-[11px] font-bold shadow-xs transition-all cursor-pointer shrink-0"
            id="open-checkin-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Check In</span>
          </button>
        </div>
      </header>

      {/* Main Grid: Score Gauge and Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Dynamic Score Gauge */}
        <div className="lg:col-span-5 bg-white border border-brand-border rounded-2xl p-6 flex flex-col justify-between" id="dashboard-score-gauge-card">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-brand-text uppercase tracking-wider">Score</span>
              <span className="text-xl font-bold text-brand-primary">{computedScore}</span>
            </div>

            {/* SVG Semicircular Gauge Chart matching corporate layout */}
            <div className="flex justify-center mt-4 mb-2 relative">
              <svg className="w-48 h-28" viewBox="0 0 200 120">
                {/* Background track arc (40 to 100) */}
                <path 
                  d="M 30 100 A 70 70 0 0 1 170 100" 
                  fill="none" 
                  stroke="#f1eedc" 
                  strokeWidth="11" 
                  strokeLinecap="round" 
                />
                {/* Filled arc representing current score */}
                <path 
                  d="M 30 100 A 70 70 0 0 1 170 100" 
                  fill="none" 
                  stroke="#8ad395" 
                  strokeWidth="11" 
                  strokeLinecap="round" 
                  strokeDasharray={gaugeCircumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
                
                {/* Needle Indicator */}
                <circle cx="100" cy="100" r="5" fill="#1c1917" />
                <line 
                  x1="100" 
                  y1="100" 
                  x2={needleX} 
                  y2={needleY} 
                  stroke="#1c1917" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  className="transition-all duration-1000 ease-out"
                />

                {/* Min/Max Text inside Gauge */}
                <text x="24" y="115" fontSize="8" fontWeight="bold" fill="#78716c" textAnchor="middle">40</text>
                <text x="176" y="115" fontSize="8" fontWeight="bold" fill="#78716c" textAnchor="middle">100</text>
              </svg>
            </div>

            {/* Wellbeing index descriptions */}
            <div className="text-center mt-2">
              <h3 className="text-lg font-extrabold text-brand-secondary">
                {getScoreTag(computedScore)}
              </h3>
              <div className="flex items-center justify-center gap-2 mt-1.5 text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">
                <span>👤 {moodHistory.length > 0 ? `${moodHistory.length} logs recorded` : '294 platform users'}</span>
              </div>
              <p className="text-[11px] text-brand-text-muted font-medium mt-3 leading-relaxed px-4">
                Degree to which your emotional, physical, and somatic parameters indicate complete wellness and mindfulness.
              </p>
            </div>
          </div>
        </div>

        {/* Right Card: Progress Overview Chart */}
        <div className="lg:col-span-7 bg-white border border-brand-border rounded-2xl p-6 flex flex-col justify-between" id="dashboard-progress-card">
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-brand-text uppercase tracking-wider">Progress Overview</span>
              
              {/* Chart Legend / Metadata Indicators */}
              <div className="flex items-center gap-4 text-[9px] text-brand-text-muted font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-primary" />
                  {moodHistory.length > 0 ? 'Your Score' : '294 platform users'}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 border-t-2 border-dashed border-[#eae6df]" />
                  Industry average
                </span>
              </div>
            </div>

            {/* Wavy smooth area chart representing trend over the year */}
            <div className="h-44 w-full" id="progress-area-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8ad395" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#8ad395" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f4f0" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 9, fill: '#78716c', fontWeight: 'bold' }} 
                  />
                  <YAxis 
                    domain={[40, 100]} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 9, fill: '#78716c', fontWeight: 'bold' }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '10px', 
                      border: '1px solid #eae6df', 
                      fontSize: '10px', 
                      fontWeight: 'bold',
                      fontFamily: 'sans-serif' 
                    }}
                  />
                  {/* Industry Average Reference Baseline (Dashed at 68) */}
                  <ReferenceLine 
                    y={68} 
                    stroke="#eae6df" 
                    strokeDasharray="4 4" 
                    strokeWidth={1.5}
                  />
                  {/* Smooth wavy Area plot matching the mockup */}
                  <Area 
                    type="monotone" 
                    dataKey="Score" 
                    stroke="#5bb374" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    name="Wellbeing Score" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-brand-text-muted font-bold uppercase tracking-wider pt-4 border-t border-brand-border mt-4">
            <span>Somatic Consistency: Stable</span>
            <span>Annual Average: 71.5%</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Key Metrics Area with Subsections matching Kyan Health */}
      <div className="space-y-6" id="dashboard-key-metrics-section">
        <div className="flex items-center gap-2 border-b border-brand-border pb-2">
          <h3 className="text-sm font-extrabold text-brand-secondary font-display tracking-tight uppercase">
            Key Metrics
          </h3>
          <Info className="w-4 h-4 text-brand-text-muted cursor-pointer hover:text-brand-primary" />
        </div>

        {/* Subsection 1: Drivers of work wellbeing */}
        <div className="space-y-3.5">
          <p className="text-[10px] text-brand-text-muted font-black uppercase tracking-widest">
            Drivers of work wellbeing
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Belonging Card */}
            <div 
              onClick={() => setSelectedMetric(metricDetails.Belonging)}
              className="bg-white border border-brand-border hover:border-brand-primary/40 rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:shadow-xs group"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] text-brand-text-muted font-bold uppercase tracking-wider">Social Needs</p>
                  <h4 className="text-xs font-extrabold text-brand-secondary group-hover:text-brand-primary transition-colors">Belonging</h4>
                </div>
                <span className="text-[9px] bg-[#eaf6ed] text-[#2c6e49] border border-[#d2edd8] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  High
                </span>
              </div>
              <div className="flex items-center justify-between mt-6 text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                <span>Learn more</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Trust Card */}
            <div 
              onClick={() => setSelectedMetric(metricDetails.Trust)}
              className="bg-white border border-brand-border hover:border-brand-primary/40 rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:shadow-xs group"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] text-brand-text-muted font-bold uppercase tracking-wider">Foundational Needs</p>
                  <h4 className="text-xs font-extrabold text-brand-secondary group-hover:text-brand-primary transition-colors">Trust</h4>
                </div>
                <span className="text-[9px] bg-[#eaf6ed] text-[#2c6e49] border border-[#d2edd8] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Above average
                </span>
              </div>
              <div className="flex items-center justify-between mt-6 text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                <span>Learn more</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Energy Card */}
            <div 
              onClick={() => setSelectedMetric(metricDetails.Energy)}
              className="bg-white border border-brand-border hover:border-brand-primary/40 rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:shadow-xs group"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] text-brand-text-muted font-bold uppercase tracking-wider">Growth Needs</p>
                  <h4 className="text-xs font-extrabold text-brand-secondary group-hover:text-brand-primary transition-colors">Energy</h4>
                </div>
                <span className="text-[9px] bg-[#f7effa] text-[#73359c] border border-[#ebd8f5] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Average
                </span>
              </div>
              <div className="flex items-center justify-between mt-6 text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                <span>Learn more</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

          </div>
        </div>

        {/* Subsection 2: Work wellbeing outcomes */}
        <div className="space-y-3.5">
          <p className="text-[10px] text-brand-text-muted font-black uppercase tracking-widest">
            Work wellbeing outcomes
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Happiness Outcome Card */}
            <div 
              onClick={() => setSelectedMetric(metricDetails.Happiness)}
              className="bg-white border border-brand-border hover:border-brand-primary/40 rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:shadow-xs group"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] text-brand-text-muted font-bold uppercase tracking-wider">Outcomes</p>
                  <h4 className="text-xs font-extrabold text-brand-secondary group-hover:text-brand-primary transition-colors">Happiness</h4>
                </div>
                <span className="text-[9px] bg-[#eaf6ed] text-[#2c6e49] border border-[#d2edd8] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  High
                </span>
              </div>
              <div className="flex items-center justify-between mt-6 text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                <span>Learn more</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Purpose Outcome Card */}
            <div 
              onClick={() => setSelectedMetric(metricDetails.Purpose)}
              className="bg-white border border-brand-border hover:border-brand-primary/40 rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:shadow-xs group"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] text-brand-text-muted font-bold uppercase tracking-wider">Outcomes</p>
                  <h4 className="text-xs font-extrabold text-brand-secondary group-hover:text-brand-primary transition-colors">Purpose</h4>
                </div>
                <span className="text-[9px] bg-[#eaf6ed] text-[#2c6e49] border border-[#d2edd8] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Above average
                </span>
              </div>
              <div className="flex items-center justify-between mt-6 text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                <span>Learn more</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL: Daily Mood/Check-In Logger Form */}
      {isCheckInOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-brand-border rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setIsCheckInOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-brand-text-muted hover:text-brand-secondary hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Smile className="w-5 h-5 text-brand-primary" />
              <h3 className="text-sm font-extrabold text-brand-secondary font-display uppercase tracking-wider">
                Daily Emotional Check-In
              </h3>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-5">
              {/* Mood Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-brand-secondary uppercase tracking-wider">
                    Mood: {getMoodEmoji(moodScore)} ({moodScore}/10)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodScore}
                  onChange={(e) => setMoodScore(parseInt(e.target.value))}
                  className="w-full accent-brand-primary h-1 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[8px] text-brand-text-muted font-bold mt-1 uppercase tracking-wider">
                  <span>Heavy / Sad</span>
                  <span>Neutral</span>
                  <span>Vibrant</span>
                </div>
              </div>

              {/* Energy Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-brand-secondary uppercase tracking-wider">
                    Energy: <Zap className="w-3.5 h-3.5 inline text-amber-500 fill-amber-500 -mt-0.5" /> ({energyLevel}/10)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  className="w-full accent-brand-primary h-1 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[8px] text-brand-text-muted font-bold mt-1 uppercase tracking-wider">
                  <span>Drained</span>
                  <span>Balanced</span>
                  <span>Charged</span>
                </div>
              </div>

              {/* Sleep Hours Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-brand-secondary uppercase tracking-wider">
                    Sleep: <Moon className="w-3.5 h-3.5 inline text-indigo-500 -mt-0.5" /> ({sleepHours} Hours)
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="12"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  className="w-full accent-brand-primary h-1 bg-slate-100 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[8px] text-brand-text-muted font-bold mt-1 uppercase tracking-wider">
                  <span>Restless</span>
                  <span>7 - 8 hrs</span>
                  <span>Fully Rested</span>
                </div>
              </div>

              {/* Reflective Note Input */}
              <div>
                <label className="block text-[10px] font-bold text-brand-secondary uppercase tracking-wider mb-1">
                  Reflective Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Stressors, small victories, somatic feelings..."
                  className="w-full p-2.5 border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-primary bg-slate-50 resize-none text-brand-secondary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Log Today's State
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Key Metric Description & Action Tips */}
      {selectedMetric && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-brand-border rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setSelectedMetric(null)}
              className="absolute top-4 right-4 p-1.5 text-brand-text-muted hover:text-brand-secondary hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 mb-4">
              <span className="text-[9px] text-brand-primary font-black uppercase tracking-widest">{selectedMetric.category}</span>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-brand-secondary font-display uppercase tracking-tight">{selectedMetric.title}</h3>
                <span className="text-[9px] bg-[#eaf6ed] text-[#2c6e49] border border-[#d2edd8] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">{selectedMetric.status}</span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-brand-text leading-relaxed font-semibold">
                {selectedMetric.desc}
              </p>

              <div className="bg-[#fcfbfa] border border-brand-border rounded-xl p-4 space-y-2.5">
                <p className="text-[10px] text-brand-secondary font-black uppercase tracking-wider">Clinical Safe Recommendations:</p>
                <ul className="space-y-2">
                  {selectedMetric.tips.map((tip, i) => (
                    <li key={i} className="text-[11px] text-brand-text-muted font-semibold flex items-start gap-2">
                      <span className="text-brand-primary font-bold mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => {
                  setActiveTab(selectedMetric.tabTarget);
                  setSelectedMetric(null);
                }}
                className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center block shadow-xs"
              >
                {selectedMetric.action}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
