import * as fs from 'fs';

const content = `import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';

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

export const Auth: React.FC = () => {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

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
      setAuthError(error.message || \`An error occurred with \${provider} sign-in.\`);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col md:flex-row min-h-[80vh] pt-2 pb-12 items-center">
      
      {/* LEFT EDITORIAL AREA */}
      <div className="w-full md:w-[58%] lg:w-[60%] flex flex-col justify-center px-8 md:px-16 lg:px-24 mb-12 md:mb-0">
        <div className="flex flex-col xl:flex-row gap-12 xl:gap-24 items-start xl:items-center w-full max-w-[800px] mx-auto">
          
          {/* Main Typography */}
          <div className="max-w-[380px] z-10 flex-shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="font-sans text-[10px] uppercase tracking-[0.2em] text-subtle/80 mb-6 sm:mb-8 flex items-center gap-4">
              <span className="w-6 h-[1px] bg-border-strong"></span>
              LexiAgent Personal Lexicon / 2026
            </div>
            <h1 className="font-serif text-[42px] sm:text-[48px] lg:text-[56px] font-medium leading-[1.05] text-foreground tracking-tight">
              Your lexicon,<br/>kept close.
            </h1>
            <p className="font-sans text-[14.5px] sm:text-[15.5px] text-subtle mt-6 max-w-[320px] leading-[1.65]">
              Save words you discover, revisit what you've learned, and keep your vocabulary in one quiet place.
            </p>
          </div>

          {/* Decorative Archive/Index Visual */}
          <div className="w-full max-w-[280px] flex-shrink-0 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
            <div className="flex flex-col">
              <div className="font-sans text-[9px] uppercase tracking-[0.15em] text-foreground mb-4">
                Personal Archive
              </div>
              <div className="w-full h-[1px] bg-foreground mb-6"></div>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-5">
                  <div className="font-serif text-[28px] text-muted/40 leading-none">01</div>
                  <div className="flex flex-col">
                    <div className="font-sans text-[10px] uppercase tracking-[0.1em] text-foreground">Discovered</div>
                    <div className="font-serif text-[12px] italic text-subtle mt-0.5">Words you have explored</div>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="font-serif text-[28px] text-muted/40 leading-none">02</div>
                  <div className="flex flex-col">
                    <div className="font-sans text-[10px] uppercase tracking-[0.1em] text-foreground">Saved</div>
                    <div className="font-serif text-[12px] italic text-subtle mt-0.5">Your personal vocabulary</div>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="font-serif text-[28px] text-muted/40 leading-none">03</div>
                  <div className="flex flex-col">
                    <div className="font-sans text-[10px] uppercase tracking-[0.1em] text-foreground">Notes</div>
                    <div className="font-serif text-[12px] italic text-subtle mt-0.5">Thoughts and contexts</div>
                  </div>
                </div>
              </div>
              
              <div className="w-full h-[1px] bg-border-subtle mt-8 mb-6"></div>
              
              <div className="font-serif italic text-[15px] text-subtle leading-relaxed pr-8">
                "A place for words worth keeping."
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT LOGIN AREA */}
      <div className="w-full md:w-[42%] lg:w-[40%] flex justify-center lg:justify-start px-6 md:px-8">
        
        <div className="w-full max-w-[420px] flex flex-col gap-8 bg-background sm:bg-[#FDFBF9] dark:bg-[#1C1C1A] p-0 sm:p-10 md:p-12 sm:shadow-[0_4px_30px_-4px_rgba(0,0,0,0.03)] dark:sm:shadow-none sm:border sm:border-border-subtle/50 rounded-[4px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-75">
          
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-[26px] font-medium text-foreground tracking-tight">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="font-sans text-[13.5px] text-subtle">
              {isLogin ? 'Sign in to continue building your personal lexicon.' : 'Join LexiAgent to build your personal lexicon.'}
            </p>
          </div>

          {authError && (
            <div className="font-sans text-[12.5px] text-red-700 dark:text-red-400 bg-red-500/10 p-3.5 rounded-[2px] border border-red-500/20">
              {authError}
            </div>
          )}
          
          {message && (
            <div className="font-sans text-[12.5px] text-green-700 dark:text-green-400 bg-green-500/10 p-3.5 rounded-[2px] border border-green-500/20">
              {message}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4.5">
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent font-sans text-[14px] border border-border-subtle/70 focus:border-foreground py-3.5 px-4 outline-none transition-colors text-foreground placeholder:text-muted rounded-[2px] focus:ring-1 focus:ring-foreground/15"
              />
              <div className="h-4"></div>
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent font-sans text-[14px] border border-border-subtle/70 focus:border-foreground py-3.5 px-4 outline-none transition-colors text-foreground placeholder:text-muted rounded-[2px] focus:ring-1 focus:ring-foreground/15 -mt-4"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex items-center justify-between w-full border border-foreground bg-foreground text-background py-4 px-5 mt-2 font-sans text-[11px] uppercase tracking-[0.22em] transition-all duration-300 disabled:opacity-50 hover:bg-transparent hover:text-foreground rounded-[2px]"
            >
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              {isSubmitting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 text-[10px] font-sans text-subtle/60 py-1">
            <div className="flex-1 border-t border-border-subtle/40"></div>
            <span className="uppercase tracking-[0.15em]">Or continue with</span>
            <div className="flex-1 border-t border-border-subtle/40"></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleOAuth('google')}
              className="flex-1 flex items-center justify-center gap-3 w-full border border-border-strong/50 py-3.5 font-sans text-[13px] text-foreground hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300 rounded-[2px] group"
            >
              <GoogleIcon />
              Google
            </button>
            <button
              onClick={() => handleOAuth('github')}
              className="flex-1 flex items-center justify-center gap-3 w-full border border-border-strong/50 py-3.5 font-sans text-[13px] text-foreground hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300 rounded-[2px] group"
            >
              <GithubIcon />
              GitHub
            </button>
          </div>

          <div className="text-left mt-2">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setAuthError('');
                setMessage('');
              }}
              className="font-sans text-[11px] uppercase tracking-[0.15em] text-subtle hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-0.5"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/pages/Auth.tsx', content);
