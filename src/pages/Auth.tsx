import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowRight, Bookmark, Check, Eye, EyeOff, Loader2, LockKeyhole, Mail, Book } from 'lucide-react';
import { motion } from 'framer-motion';

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
  </svg>
);

const wordPins = [
  {
    word: 'serendipity',
    note: 'happy accident',
    color: 'bg-[#FFE6E0] dark:bg-[#51332F]',
    className: 'col-span-5 mt-10 rotate-[-2deg]',
  },
  {
    word: 'sonder',
    note: 'everyone has a story',
    color: 'bg-[#E5F1FF] dark:bg-[#24384C]',
    className: 'col-span-4 rotate-[2deg]',
  },
  {
    word: 'glow-up',
    note: 'version 2.0',
    color: 'bg-[#F3E8FF] dark:bg-[#3C2D4B]',
    className: 'col-span-4 mt-6 rotate-[-1deg]',
  },
  {
    word: 'apricity',
    note: 'sun warmth in winter',
    color: 'bg-[#FFF3C7] dark:bg-[#4A3D24]',
    className: 'col-span-5 mt-2 rotate-[1deg]',
  },
];

export const Auth: React.FC = () => {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (isLoading) return null;
  if (session) return <Navigate to="/" replace />;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError('');
    setMessage('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (data.session) {
          navigate('/');
        } else {
          setMessage('Account created! Please check your email for a confirmation link.');
        }
      }
    } catch (error: any) {
      setAuthError(error.message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setAuthError(error.message || `An error occurred with ${provider} sign-in.`);
    }
  };

  return (
    <div className="flex-1 w-full px-4 pb-8 sm:px-6 md:px-10 lg:px-12">
      <div className="mx-auto grid min-h-[calc(100dvh-8rem)] w-full max-w-[1400px] items-center gap-8 lg:grid-cols-[1.1fr_0.85fr] xl:gap-16 py-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-xl border border-border-subtle bg-surface/70 px-6 py-8 shadow-[0_24px_70px_-52px_rgba(42,41,40,0.55)] dark:bg-surface/60 sm:px-10 sm:py-12 lg:min-h-[640px] xl:min-h-[680px] lg:px-12 flex flex-col justify-center"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-border-strong/40" />
          <div className="relative z-10 grid h-full gap-10 xl:gap-14 lg:grid-cols-[0.9fr_1fr] lg:items-center">
            <div className="max-w-[500px]">
              <div className="mb-6 flex w-fit items-center gap-2 rounded-[6px] border border-border-subtle bg-background/80 px-3 py-2 text-[11px] font-medium uppercase text-muted shadow-subtle">
                <Book size={14} strokeWidth={1.8} className="text-foreground/70" />
                LexiAgent Personal Archive
              </div>
              <h1 className="font-serif text-[44px] font-medium leading-[0.98] tracking-tight text-foreground sm:text-[60px] lg:text-[68px]">
                Master your words.
                <span className="mt-2 block italic text-muted">Keep the meaning.</span>
              </h1>
              <p className="mt-6 max-w-[390px] text-base leading-7 text-muted">
                Curate a vocabulary archive that feels personal, searchable, and ready whenever a new word catches your attention.
              </p>

              <div className="mt-8 grid max-w-[430px] grid-cols-3 gap-3">
                {[
                  ['A—Z', 'definitions'],
                  ['Audio', 'pronunciations'],
                  ['Synced', 'vocabulary'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-md border border-border-subtle bg-background/70 p-3 shadow-subtle">
                    <p className="font-serif text-xl leading-none text-foreground">{value}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-subtle">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[380px] overflow-hidden rounded-lg border border-border-subtle bg-foreground/5 p-4 dark:bg-[#24211E] sm:min-h-[460px] sm:p-5 w-full">
              <div className="grid grid-cols-9 gap-3 sm:gap-4">
                {wordPins.map((pin, index) => (
                  <motion.article
                    key={pin.word}
                    initial={{ opacity: 0, y: 20, rotate: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.12 + index * 0.08, ease: 'easeOut' }}
                    className={`${pin.className} ${pin.color} rounded-md border border-black/[0.04] p-4 shadow-[0_16px_36px_-24px_rgba(42,41,40,0.65)] dark:border-white/[0.06]`}
                  >
                    <div className="mb-5 flex items-center justify-between text-muted">
                      <Bookmark size={14} strokeWidth={1.8} />
                      <span className="h-2 w-2 rounded-full bg-current opacity-30" />
                    </div>
                    <h2 className="font-serif text-[22px] leading-none tracking-tight text-foreground sm:text-[26px]">
                      {pin.word}
                    </h2>
                    <p className="mt-3 text-xs leading-5 text-muted">{pin.note}</p>
                  </motion.article>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
                className="absolute bottom-5 left-5 right-5 rounded-md border border-border-subtle bg-surface/90 p-4 shadow-[0_20px_48px_-32px_rgba(42,41,40,0.7)] backdrop-blur"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
                    <Bookmark size={16} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Your latest save is waiting.</p>
                    <p className="mt-1 text-xs leading-5 text-muted">Return to definitions, contexts, and notes in one polished library.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <div className="flex w-full justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: 'easeOut' }}
            className="w-full max-w-[480px] rounded-xl border border-border-subtle bg-surface p-8 shadow-[0_28px_80px_-52px_rgba(42,41,40,0.75)] dark:bg-[#1F1E1B] sm:p-10 md:p-12 xl:p-14"
          >
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <div className="mb-4 flex w-fit items-center gap-2 rounded-[4px] bg-foreground/5 px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase text-foreground">
                  <Check size={13} strokeWidth={2} />
                  {isLogin ? 'Secure Sign In' : 'Create an Account'}
                </div>
                <h2 className="font-serif text-[32px] font-medium leading-tight tracking-tight text-foreground">
                  {isLogin ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {isLogin ? 'Sign in to continue building your personal lexicon.' : 'Join LexiAgent and start archiving the words you discover.'}
                </p>
              </div>
            </div>

            {authError && (
              <div className="mb-5 rounded-md border border-red-500/20 bg-red-500/10 p-3.5 text-[13px] text-red-700 dark:text-red-300">
                {authError}
              </div>
            )}
            
            {message && (
              <div className="mb-5 rounded-md border border-green-500/20 bg-green-500/10 p-3.5 text-[13px] text-green-700 dark:text-green-300">
                {message}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="flex flex-col gap-5">
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-muted">Email</span>
                  <span className="relative block">
                    <Mail size={17} strokeWidth={1.8} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 w-full rounded-md border border-border-subtle bg-background/70 py-3 pl-11 pr-4 text-base text-foreground outline-none transition-all placeholder:text-subtle focus:border-foreground focus:bg-surface focus:ring-4 focus:ring-foreground/10"
                    />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-muted">Password</span>
                  <span className="relative block">
                    <LockKeyhole size={17} strokeWidth={1.8} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 w-full rounded-md border border-border-subtle bg-background/70 py-3 pl-11 pr-12 text-base text-foreground outline-none transition-all placeholder:text-subtle focus:border-foreground focus:bg-surface focus:ring-4 focus:ring-foreground/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-subtle transition-colors hover:bg-surface-tint hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={17} strokeWidth={1.8} /> : <Eye size={17} strokeWidth={1.8} />}
                    </button>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group mt-1 flex h-13 min-h-13 w-full items-center justify-between rounded-sm border border-foreground bg-foreground px-5 text-sm font-medium uppercase tracking-[0.1em] text-background transition-all duration-300 hover:-translate-y-0.5 hover:bg-transparent hover:text-foreground hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/15 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                {isSubmitting ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <ArrowRight size={17} strokeWidth={1.8} className="transition-transform group-hover:translate-x-1" />
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.2em] text-subtle">
              <div className="flex-1 border-t border-border-subtle"></div>
              <span>Or continue with</span>
              <div className="flex-1 border-t border-border-subtle"></div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={() => handleOAuth('google')}
                className="flex h-12 items-center justify-center gap-3 rounded-md border border-border-subtle bg-background/70 text-sm font-medium text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/10"
              >
                <GoogleIcon />
                Google
              </button>
              <button
                onClick={() => handleOAuth('github')}
                className="flex h-12 items-center justify-center gap-3 rounded-md border border-border-subtle bg-background/70 text-sm font-medium text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/10"
              >
                <GithubIcon />
                GitHub
              </button>
            </div>

            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setAuthError('');
                setMessage('');
              }}
              className="mt-7 w-full rounded-md border border-dashed border-border-strong/70 px-4 py-3 text-sm font-medium text-muted transition-colors hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/10"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
