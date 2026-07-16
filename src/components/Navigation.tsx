import React from 'react';
import { 
  Compass, 
  BarChart3, 
  LineChart,
  Activity,
  HeartHandshake, 
  AlertTriangle, 
  BookOpen, 
  Users, 
  LogOut,
  PhoneCall,
  Sun,
  Moon,
  Brain
} from 'lucide-react';
import { BrandLogoIMG7747 } from './BrandLogo';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userNickname: string;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Navigation({ 
  activeTab, 
  setActiveTab, 
  userNickname, 
  onLogout,
  theme,
  onToggleTheme
}: NavigationProps) {
  const menuItems = [
    { id: 'companion', name: 'AI Counselling Chatbot', icon: HeartHandshake },
    { id: 'voice', name: 'AI Voice Call', icon: PhoneCall },
    { id: 'memory', name: 'Long-Term Memory', icon: Brain },
    { id: 'journal', name: 'Summary & Log', icon: Compass },
    { id: 'emergency', name: 'Risk Forecast', icon: AlertTriangle, critical: true },
    { id: 'dashboard', name: 'Wellbeing Insights', icon: LineChart },
    { id: 'profile', name: 'Usage Insights', icon: BarChart3 },
    { id: 'plans', name: 'Resources', icon: BookOpen },
    { id: 'community', name: 'Community Board', icon: Users },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-brand-border flex flex-col justify-between shrink-0" id="navigation-sidebar">
      <div>
        {/* Brand Header */}
        <div className="p-6 pb-2">
          <div className="flex items-center gap-2.5">
            {/* Elegant high-fidelity brand logo matching IMG_7747 */}
            <BrandLogoIMG7747 className="w-9 h-9 rounded-lg shrink-0 border border-brand-border/15 shadow-sm" />
            <div className="leading-none">
              <h1 className="text-sm font-extrabold tracking-wider text-brand-secondary font-display uppercase">
                PsycHeal
              </h1>
              <p className="text-[10px] text-brand-primary font-bold uppercase tracking-widest mt-0.5">Wellness</p>
            </div>
          </div>
        </div>

        {/* Dashboard Group Header */}
        <div className="px-6 pt-6">
          <p className="text-[9px] text-brand-text-muted font-bold tracking-wider uppercase">
            Dashboard
          </p>
        </div>

        {/* Navigation List */}
        <nav className="px-3 py-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#2c6e49] text-white font-bold shadow-sm'
                    : item.critical
                      ? 'text-rose-600 hover:bg-rose-50'
                      : 'text-brand-text hover:bg-slate-50 hover:text-brand-secondary'
                }`}
                id={`nav-item-${item.id}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.critical ? 'text-rose-500' : 'text-brand-text-muted'}`} />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-brand-border bg-slate-50/50">
        {/* Theme Switcher section */}
        <div className="flex items-center justify-between mb-3.5 pb-3.5 border-b border-brand-border/60">
          <span className="text-[10px] text-brand-text-muted font-bold uppercase tracking-wider">
            Appearance
          </span>
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-brand-border bg-white text-brand-secondary text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all hover:bg-brand-primary hover:text-white hover:border-brand-primary shadow-xs"
            id="theme-switcher-btn"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3 h-3 text-indigo-500" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#eaf6ed] flex items-center justify-center font-bold text-xs text-[#2c6e49] border border-brand-border shrink-0">
              {userNickname.substring(0, 1).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-brand-secondary truncate">{userNickname}</p>
              <p className="text-[10px] text-brand-text-muted font-medium">Wellness Member</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-brand-text-muted hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Sign Out"
            id="nav-logout-btn"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
