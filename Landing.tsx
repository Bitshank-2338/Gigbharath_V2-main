
import React, { useEffect, useRef, useState } from 'react';
import { UserRole } from '../types';
import { api } from '../services/api';
import { Briefcase, User, ShieldAlert, Lock, Mail, ArrowRight, Loader, Cpu, CheckCircle } from 'lucide-react';

interface LandingProps {
  onLogin: (role: UserRole) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const FREELANCER_PERKS = [
  'Build a verified Trust Quotient score',
  'Access premium gigs across India',
  'Get certified & join elite teams',
];

const EMPLOYER_PERKS = [
  'Hire background-verified talent instantly',
  'Manage projects with milestone tracking',
  'Scale with flexible freelance teams',
];

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

const parseGoogleCredential = (credential: string) => {
  const payload = credential.split('.')[1];
  if (!payload) throw new Error('Invalid Google credential response.');

  const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
  const decodedPayload = decodeURIComponent(
    atob(normalizedPayload)
      .split('')
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join('')
  );

  return JSON.parse(decodedPayload) as {
    email: string;
    name: string;
    picture?: string;
    email_verified?: boolean;
  };
};

const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleScriptId = 'gigbharat-google-gsi';

  const handleGoogleAuth = async (credential: string) => {
    setError('');
    setLoading(true);

    try {
      if (!activeRole || activeRole === UserRole.ADMIN) {
        throw new Error('Google sign-in is available for freelancer and employer accounts only.');
      }

      const profile = parseGoogleCredential(credential);
      const user = api.auth.loginWithGoogle({
        email: profile.email,
        name: profile.name,
        role: activeRole,
        avatarUrl: profile.picture,
        emailVerified: profile.email_verified,
      });

      if (profile.email_verified) {
        setToastMessage('Identity Verified: +10 Trust Points!');
        window.setTimeout(() => {
          onLogin(user.role);
        }, 1200);
      } else {
        onLogin(user.role);
      }
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!toastMessage) return;

    const timer = window.setTimeout(() => setToastMessage(''), 2200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!activeRole || activeRole === UserRole.ADMIN || !GOOGLE_CLIENT_ID || !googleButtonRef.current) return;

    let cancelled = false;

    const renderGoogleButton = () => {
      if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return;

      googleButtonRef.current.innerHTML = '';
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: ({ credential }) => {
          if (!credential) return;
          void handleGoogleAuth(credential);
        }
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: isRegistering ? 'signup_with' : 'continue_with',
        logo_alignment: 'left',
        width: 320
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
      return () => {
        cancelled = true;
      };
    }

    let script = document.getElementById(googleScriptId) as HTMLScriptElement | null;
    const handleLoad = () => renderGoogleButton();

    if (!script) {
      script = document.createElement('script');
      script.id = googleScriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = handleLoad;
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', handleLoad);
    }

    return () => {
      cancelled = true;
      if (script) script.removeEventListener('load', handleLoad);
    };
  }, [activeRole, isRegistering]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!activeRole) throw new Error('Please select a role');

      if (isRegistering) {
        await api.auth.register({ name, email, password, role: activeRole });
      } else {
        await api.auth.login(email, password, activeRole);
      }
      onLogin(activeRole);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!activeRole) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center py-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="icon-glow-sky w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 mx-auto mb-7 flex items-center justify-center">
            <Cpu size={38} className="text-white" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-950 leading-none">
            Gigs<span className="text-gradient-brand">Bharat</span>
          </h1>
          <p className="mt-4 text-lg text-slate-500 font-medium max-w-md mx-auto">
            India's premier platform for verified freelance talent — powered by Trust Quotient intelligence.
          </p>
        </div>

        {/* Role Cards */}
        <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Freelancer */}
          <button
            onClick={() => setActiveRole(UserRole.FREELANCER)}
            className="card-premium p-7 text-left group cursor-pointer animate-fade-in-up delay-100"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200 ring-1 ring-sky-100">
              <User size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Freelancer & Talent</h2>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Build your reputation, get verified, and land top gigs.
            </p>
            <ul className="space-y-2">
              {FREELANCER_PERKS.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle size={14} className="text-sky-500 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-sky-600 group-hover:gap-2.5 transition-all duration-200">
              Get started <ArrowRight size={15} />
            </div>
          </button>

          {/* Employer */}
          <button
            onClick={() => setActiveRole(UserRole.EMPLOYER)}
            className="card-premium p-7 text-left group cursor-pointer animate-fade-in-up delay-200"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-200 ring-1 ring-orange-100">
              <Briefcase size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Employer & Startup</h2>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Hire elite verified talent and scale your team on demand.
            </p>
            <ul className="space-y-2">
              {EMPLOYER_PERKS.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm text-slate-600">
                  <CheckCircle size={14} className="text-orange-500 shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-orange-600 group-hover:gap-2.5 transition-all duration-200">
              Start hiring <ArrowRight size={15} />
            </div>
          </button>
        </div>

        <div className="mt-10 animate-fade-in delay-300">
          <button
            onClick={() => setActiveRole(UserRole.ADMIN)}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <ShieldAlert size={13} /> Admin access
          </button>
        </div>
      </div>
    );
  }

  const isFreelancer = activeRole === UserRole.FREELANCER;
  const accentClass = isFreelancer ? 'text-sky-600' : 'text-orange-600';

  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[200] rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-2xl animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle size={18} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Identity Verified</p>
              <p className="text-sm font-semibold text-gray-900">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Back */}
        <button
          onClick={() => setActiveRole(null)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-8"
        >
          <ArrowRight size={14} className="rotate-180" /> Back to role selection
        </button>

        {/* Logo lockup */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 flex items-center justify-center shrink-0">
            <Cpu size={20} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900 leading-tight block">
              {isRegistering ? 'Join GigsBharat' : 'Welcome back'}
            </span>
            <span className="text-sm text-slate-500">
              Signing in as <span className={`font-semibold ${accentClass}`}>{activeRole}</span>
            </span>
          </div>
        </div>

        {/* Form card */}
        <div className="card-premium p-8">
          {activeRole !== UserRole.ADMIN && (
            <div className="mb-6">
              {GOOGLE_CLIENT_ID ? (
                <>
                  <div ref={googleButtonRef} className="w-full flex justify-center" />
                  <div className="mt-4 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span>or continue with email</span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                </>
              ) : (
                <div className="bg-slate-50 text-slate-500 px-4 py-3 rounded-lg text-sm border border-slate-200">
                  Google sign-in is not configured yet. Add `VITE_GOOGLE_CLIENT_ID` to your local env to enable it.
                </div>
              )}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleAuth}>
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                <ShieldAlert size={15} className="shrink-0" /> {error}
              </div>
            )}

            {isRegistering && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="input-premium"
                    placeholder="Neil Kumar"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-premium"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-premium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full mt-2 ${
                !isFreelancer
                  ? '[background:linear-gradient(135deg,#f97316_0%,#ea580c_60%,#c2410c_100%)] [box-shadow:0_4px_14px_rgba(234,88,12,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]'
                  : ''
              }`}
            >
              {loading ? <Loader className="animate-spin" size={18} /> : (isRegistering ? 'Create account' : 'Sign in')}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <span className="text-sm text-slate-500">
              {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className={`text-sm font-semibold ${accentClass} hover:underline`}
            >
              {isRegistering ? 'Sign in' : 'Create one'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
