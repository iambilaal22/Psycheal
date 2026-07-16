import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  BrainCircuit, 
  LineChart, 
  MessageSquareHeart,
  ShieldAlert,
  KeyRound,
  RotateCw,
  ArrowLeft
} from 'lucide-react';
import { UserProfile } from '../types';
import { BrandLogoIMG7751 as BrandLogo } from './BrandLogo';
import { auth, isRealFirebaseConfigured } from '../lib/firebase';

interface AuthScreenProps {
  onAuthSuccess: (profile: UserProfile) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Email verification states
  const [verificationMode, setVerificationMode] = useState(false);
  const [mockExpectedCode, setMockExpectedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [tempProfile, setTempProfile] = useState<UserProfile | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [notification, setNotification] = useState('');

  // Handle countdown for resending verification code/email
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotification('');
    
    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    if (isSignUp && !nickname) {
      setError('Please choose a soothing nickname so we can address you personally.');
      return;
    }

    setLoading(true);

    if (isSignUp) {
      if (isRealFirebaseConfigured) {
        try {
          const { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } = await import('firebase/auth');
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          if (auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName: nickname });
            await sendEmailVerification(auth.currentUser);
            
            setTempProfile({
              uid: userCredential.user.uid,
              email: userCredential.user.email || email,
              nickname,
              premium: isPremium,
              joinedAt: new Date().toISOString(),
              checkInStreak: 1,
              dailyGoalMinutes: 15
            });
            setVerificationMode(true);
            setNotification('A verification link has been sent to your email. Please check your inbox.');
          }
        } catch (err: any) {
          setError(err.message || 'An error occurred during signup. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        // Fallback Mock Email Verification Signup
        setTimeout(() => {
          const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
          setMockExpectedCode(generatedCode);
          setTempProfile({
            uid: `user_${Date.now()}`,
            email,
            nickname,
            premium: isPremium,
            joinedAt: new Date().toISOString(),
            checkInStreak: 1,
            dailyGoalMinutes: 15
          });
          setVerificationMode(true);
          setLoading(false);
          setNotification('A simulated 6-digit verification code has been generated.');
        }, 800);
      }
    } else {
      // Sign In Flow
      if (isRealFirebaseConfigured) {
        try {
          const { signInWithEmailAndPassword, sendEmailVerification, signOut } = await import('firebase/auth');
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          
          if (!userCredential.user.emailVerified) {
            // Send another verification link and sign out
            await sendEmailVerification(userCredential.user);
            await signOut(auth);
            setError('Your email address is not verified yet. We have sent a new verification link to your email. Please check your inbox and verify your email before logging in.');
            setLoading(false);
            return;
          }

          const verifiedProfile: UserProfile = {
            uid: userCredential.user.uid,
            email: userCredential.user.email || email,
            nickname: userCredential.user.displayName || email.split('@')[0],
            premium: isPremium,
            joinedAt: new Date().toISOString(),
            checkInStreak: 1,
            dailyGoalMinutes: 15
          };
          onAuthSuccess(verifiedProfile);
        } catch (err: any) {
          setError(err.message || 'Invalid email or password. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        // Fallback Mock Sign In
        setTimeout(() => {
          const mockProfile: UserProfile = {
            uid: `user_${Date.now()}`,
            email,
            nickname: email.split('@')[0],
            premium: isPremium,
            joinedAt: new Date().toISOString(),
            checkInStreak: 1,
            dailyGoalMinutes: 15
          };
          setLoading(false);
          onAuthSuccess(mockProfile);
        }, 800);
      }
    }
  };

  const handleVerifyMockCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotification('');

    if (enteredCode !== mockExpectedCode) {
      setError('Invalid verification code. Please check and try again.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (tempProfile) {
        onAuthSuccess(tempProfile);
      }
    }, 1000);
  };

  const handleCheckRealFirebaseVerification = async () => {
    setError('');
    setNotification('');
    setLoading(true);

    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          if (tempProfile) {
            onAuthSuccess(tempProfile);
          }
        } else {
          setError('Email not verified yet. Please check your email inbox and click the verification link.');
        }
      } else {
        setError('No active user session found. Please try logging in again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify email status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setNotification('');
    setCountdown(60);

    if (isRealFirebaseConfigured) {
      try {
        if (auth.currentUser) {
          const { sendEmailVerification } = await import('firebase/auth');
          await sendEmailVerification(auth.currentUser);
          setNotification('A fresh verification link has been sent to your email.');
        } else {
          setError('Failed to resend verification. Please sign up again.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to resend verification email.');
      }
    } else {
      const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
      setMockExpectedCode(generatedCode);
      setNotification(`A new simulated 6-digit verification code has been generated.`);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col md:flex-row" id="auth-screen-container">
      
      {/* LEFT PANEL: Professional Brand Showcase (visible on MD screens and up) */}
      <div className="hidden md:flex md:w-1/2 bg-[#122b1c] text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden shrink-0">
        {/* Subtle decorative background glow grids */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-radial from-[#5bb374]/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-radial from-[#8ad395]/10 to-transparent blur-3xl pointer-events-none" />

        {/* Logo and branding */}
        <div className="flex items-center gap-3 relative z-10">
          <BrandLogo className="w-10 h-10 rounded-xl shrink-0" />
          <div>
            <h1 className="text-lg font-black tracking-wider uppercase font-display text-white">
              Psyc<span className="text-[#8ad395]">Heal</span>
            </h1>
            <p className="text-[10px] text-[#8ad395] font-bold uppercase tracking-widest leading-none mt-0.5">Clinical Wellness</p>
          </div>
        </div>

        {/* Informative Value Prop Cards */}
        <div className="space-y-8 my-auto relative z-10 max-w-lg">
          <div className="space-y-3">
            <span className="text-[11px] bg-[#224731] border border-[#315d43] text-[#8ad395] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Evidence-Based Mental Care
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight font-display leading-tight text-white">
              Your confidential sanctuary for cognitive resilience.
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed font-medium">
              PsycHeal merges clinical psychology principles with advanced empathetic AI tools to empower emotional awareness, grounding habits, and proactive mental support.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            {/* Feature 1 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#224731] flex items-center justify-center shrink-0 text-[#8ad395]">
                <MessageSquareHeart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Empathetic AI Companion</h4>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">24/7 safe counselling dialogue focusing on emotional validation and gentle somatic grounding.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#224731] flex items-center justify-center shrink-0 text-[#8ad395]">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Cognitive Reflection Journal</h4>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">Guided CBT journal prompts with intelligent psychological insights to structure daily thoughts.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#224731] flex items-center justify-center shrink-0 text-[#8ad395]">
                <LineChart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Wellbeing Analytics</h4>
                <p className="text-xs text-stone-300 mt-1 leading-relaxed">Track drivers of workspace wellbeing including belonging, trust, energy, and daily mental focus.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer quote */}
        <div className="text-xs text-stone-400 font-medium relative z-10">
          © {new Date().getFullYear()} OneHeal. Built on clinical standards for private, self-guided reflection.
        </div>
      </div>

      {/* RIGHT PANEL: Polished interactive authentication forms */}
      <div className="w-full md:w-1/2 flex flex-col justify-center py-10 px-6 sm:px-12 lg:px-16 bg-brand-bg relative overflow-y-auto" id="auth-right-panel">
        
        {/* Mobile Brand Header */}
        <div className="flex md:hidden items-center gap-2.5 mb-8">
          <BrandLogo className="w-9 h-9 rounded-lg shrink-0" />
          <div>
            <h1 className="text-base font-black tracking-wider uppercase font-display text-brand-secondary">
              Psyc<span className="text-brand-primary">Heal</span>
            </h1>
            <p className="text-[9px] text-brand-primary font-bold uppercase tracking-widest leading-none mt-0.5">Clinical Wellness</p>
          </div>
        </div>

        <div className="max-w-md w-full mx-auto space-y-8">
          
          {/* Header Typography */}
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-brand-secondary tracking-tight font-display">
              {verificationMode ? 'Verify your email address' : isSignUp ? 'Create your wellness account' : 'Sign in to your sanctuary'}
            </h2>
            <p className="text-xs text-brand-text-muted font-semibold mt-1.5 leading-relaxed">
              {verificationMode 
                ? 'An email verification is required to ensure your psychological sanctuary remains confidential.'
                : isSignUp 
                  ? 'Begin your personalized cognitive journey. Completely secure and encrypted.' 
                  : 'Welcome back. Let’s check in on your emotional balance and workspace drivers.'}
            </p>
          </div>

          {/* Clean Form Card */}
          <div className="bg-white border border-brand-border rounded-2xl p-6 sm:p-8 shadow-xs">
            {verificationMode ? (
              <div className="space-y-5">
                {notification && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-semibold leading-relaxed flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{notification}</span>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-bold leading-relaxed flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="p-4 bg-slate-50/50 border border-brand-border rounded-xl space-y-3">
                  <span className="text-[10px] font-black text-brand-secondary uppercase tracking-widest block">
                    Verification Sent to
                  </span>
                  <p className="text-xs font-bold text-brand-primary break-all">{email}</p>
                  
                  {!isRealFirebaseConfigured && (
                    <div className="pt-2 border-t border-brand-border mt-2 space-y-2">
                      <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 py-1 px-2.5 rounded-md inline-block uppercase tracking-wider">
                        Preview Sandbox Active
                      </div>
                      <p className="text-xs text-brand-text-muted leading-relaxed">
                        To test the verification flow in this sandbox, enter the simulated 6-digit security code generated for your inbox:
                      </p>
                      <div className="flex items-center justify-center p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                        <span className="text-2xl font-black text-brand-secondary font-mono tracking-widest">
                          {mockExpectedCode}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {isRealFirebaseConfigured ? (
                  <div className="space-y-4">
                    <p className="text-xs text-brand-text-muted leading-relaxed">
                      Please open the link we emailed to <strong className="text-brand-secondary">{email}</strong> to verify your account, then click the confirmation button below.
                    </p>
                    <button
                      onClick={handleCheckRealFirebaseVerification}
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-xl shadow-xs text-xs font-extrabold text-white bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all duration-150 flex items-center justify-center cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'I have verified my email'
                      )}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleVerifyMockCode} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-black text-brand-secondary uppercase tracking-widest">
                        6-Digit Security Code
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-text-muted">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          value={enteredCode}
                          onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                          className="block w-full pl-10 pr-3.5 py-3 border border-brand-border rounded-xl text-sm font-bold font-mono tracking-widest text-center focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-slate-50/50 text-brand-secondary"
                          placeholder="000000"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || enteredCode.length !== 6}
                      className="w-full py-3 px-4 rounded-xl shadow-xs text-xs font-extrabold text-white bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-55 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all duration-150 flex items-center justify-center cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Verify Code & Enter Sanctuary'
                      )}
                    </button>
                  </form>
                )}

                <div className="flex flex-col gap-2 pt-3 border-t border-brand-border mt-4 text-center">
                  <button
                    onClick={handleResendCode}
                    disabled={countdown > 0}
                    className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer mx-auto"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    {countdown > 0 ? `Resend Code in ${countdown}s` : 'Resend Verification Code'}
                  </button>

                  <button
                    onClick={() => {
                      setVerificationMode(false);
                      setError('');
                      setNotification('');
                    }}
                    className="text-xs font-bold text-brand-text-muted hover:text-brand-secondary mt-1 flex items-center justify-center gap-1 hover:underline cursor-pointer mx-auto"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Signup / Change Email
                  </button>
                </div>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                
                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl font-bold leading-relaxed">
                    {error}
                  </div>
                )}

                {/* Dynamic Nickname Input (sign up only) */}
                {isSignUp && (
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-brand-secondary uppercase tracking-widest">
                      Your Soothing Nickname
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-text-muted">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="block w-full pl-10 pr-3.5 py-3 border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-slate-50/50 text-brand-secondary"
                        placeholder="e.g. Amber or Sunny"
                        id="auth-nickname-input"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black text-brand-secondary uppercase tracking-widest">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-text-muted">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3.5 py-3 border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-slate-50/50 text-brand-secondary"
                      placeholder="name@company.com"
                      id="auth-email-input"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-black text-brand-secondary uppercase tracking-widest">
                      Password
                    </label>
                    {!isSignUp && (
                      <button type="button" className="text-[10px] font-bold text-brand-primary hover:underline">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-text-muted">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3.5 py-3 border border-brand-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-slate-50/50 text-brand-secondary"
                      placeholder="••••••••"
                      id="auth-password-input"
                    />
                  </div>
                </div>

                {/* Simulated Premium Switch (Elegant Design) */}
                <div className="flex items-center justify-between p-3.5 bg-[#eaf6ed]/50 border border-[#d2edd8] rounded-xl">
                  <div className="flex items-start gap-2.5">
                    <Heart className="w-4 h-4 text-[#2c6e49] mt-0.5 shrink-0" />
                    <div className="leading-tight">
                      <span className="block text-xs font-bold text-brand-secondary">Enable Premium Tier</span>
                      <span className="block text-[9px] text-[#2c6e49] font-semibold mt-0.5">Unlocks unlimited voice calls & custom CBT paths</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                    className="w-4 h-4 accent-brand-primary focus:ring-brand-primary border-brand-border rounded cursor-pointer"
                    id="auth-premium-checkbox"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl shadow-xs text-xs font-extrabold text-white bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all duration-150 flex items-center justify-center cursor-pointer"
                    id="auth-submit-btn"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isSignUp ? (
                      'Create My Sanctuary Account'
                    ) : (
                      'Access My Safe Space'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Form Mode Toggle */}
            {!verificationMode && (
              <div className="mt-6 text-center border-t border-brand-border pt-4">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover hover:underline cursor-pointer"
                  id="auth-toggle-btn"
                >
                  {isSignUp ? 'Already have an account? Sign In' : 'New to PsycHeal? Create an account'}
                </button>
              </div>
            )}
          </div>

          {/* Clinical Safe Disclaimer */}
          <div className="space-y-3 pt-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50/50 border border-amber-200/50 rounded-full text-[9px] font-bold text-amber-800 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Professional Safety Guidelines
            </div>
            <p className="text-[10px] text-brand-text-muted leading-relaxed font-semibold">
              <span className="text-brand-secondary font-black">Clinical Disclaimer:</span> PsycHeal is developed to guide self-reflection and emotional awareness. It is <span className="text-rose-600 font-bold">NOT a clinical diagnosis tool or medical therapy provider</span>. In immediate danger, please reach out to local emergency services.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
