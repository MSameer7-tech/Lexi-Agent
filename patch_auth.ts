import * as fs from 'fs';

const content = `import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const WordSlip = ({ word, phonetic, def, className }: { word: string, phonetic?: string, def?: string, className: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className={cn(
      "absolute bg-[#FCFAFA] dark:bg-[#1E1E1C] border border-stone-200/60 dark:border-stone-800/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] dark:shadow-none p-4 sm:p-5 flex flex-col gap-1.5 rounded-[2px]", 
      className
    )}
  >
    <span className="font-serif text-[17px] sm:text-[19px] text-foreground leading-none">{word}</span>
    {phonetic && <span className="font-sans text-[10px] text-muted tracking-widest">{phonetic}</span>}
    {def && <span className="font-serif text-[12px] sm:text-[13px] text-subtle italic max-w-[140px] leading-relaxed mt-1">{def}</span>}
  </motion.div>
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
    <div className="flex-1 w-full flex flex-col md:flex-row min-h-[calc(100vh-100px)] pt-6 md:pt-0">
      {/* LEFT EDITORIAL AREA */}
      <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col justify-center px-8 py-12 md:px-16 lg:px-24 relative overflow-hidden">
        
        <div className="max-w-[500px] z-10 relative">
          <div className="font-sans text-[9px] uppercase tracking-[0.2em] text-subtle mb-6 sm:mb-8">
            LexiAgent Personal Vocabulary / 01
          </div>
          <h1 className="font-serif text-[42px] sm:text-[52px] lg:text-[64px] font-medium leading-[1.05] text-foreground tracking-tight">
            Words,<br/>understood<br/>differently.
          </h1>
          <p className="font-sans text-sm sm:text-[15px] text-subtle mt-6 max-w-[340px] leading-[1.6]">
            Discover meaning, nuance, and vocabulary with a little help from AI.
          </p>
        </div>

        {/* FLOATING VOCABULARY SLIPS (Hidden on mobile) */}
        <div className="hidden md:block absolute right-[5%] lg:right-[15%] top-1/2 -translate-y-1/2 w-[350px] h-[500px] pointer-events-none select-none">
          <WordSlip 
            word="ephemeral" 
            phonetic="/i-ˈfe-mə-rəl/" 
            def="lasting for a very short time" 
            className="top-[10%] left-[10%] -rotate-[2deg] z-10"
          />
          <WordSlip 
            word="pragmatic" 
            def="practical; realistic" 
            className="top-[40%] left-[-10%] rotate-[1deg] z-20 scale-95"
          />
          <WordSlip 
            word="serendipity" 
            def="a fortunate discovery" 
            className="top-[35%] left-[45%] rotate-[3deg] z-10 scale-90"
          />
          <WordSlip 
            word="meticulous" 
            phonetic="/mə-ˈti-kyə-ləs/"
            def="very careful; precise" 
            className="top-[70%] left-[20%] -rotate-[1.5deg] z-30"
          />
        </div>
      </div>

      {/* RIGHT LOGIN AREA */}
      <div className="w-full md:w-[45%] lg:w-[40%] flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 relative">
        {/* Subtle background separator on desktop */}
        <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[1px] h-[70vh] bg-border-subtle/40"></div>
        
        <div className="w-full max-w-[360px] flex flex-col gap-8 bg-background sm:bg-[#FDFBF9] dark:bg-[#1E1E1C] p-0 sm:p-10 sm:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] dark:sm:shadow-none sm:border sm:border-border-subtle/40 rounded-[2px]">
          
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-[24px] font-medium text-foreground tracking-tight">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="font-sans text-[13px] text-subtle">
              {isLogin ? 'Sign in to sync your lexicon.' : 'Join LexiAgent to save your history.'}
            </p>
          </div>

          {authError && (
            <div className="font-sans text-xs text-red-700 dark:text-red-400 bg-red-500/10 p-3 rounded-[2px] border border-red-500/20">
              {authError}
            </div>
          )}
          
          {message && (
            <div className="font-sans text-xs text-green-700 dark:text-green-400 bg-green-500/10 p-3 rounded-[2px] border border-green-500/20">
              {message}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent font-sans text-[13px] border border-border-subtle/60 focus:border-foreground py-2.5 px-3 outline-none transition-colors text-foreground placeholder:text-muted rounded-[2px] focus:ring-1 focus:ring-foreground/10"
              />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent font-sans text-[13px] border border-border-subtle/60 focus:border-foreground py-2.5 px-3 outline-none transition-colors text-foreground placeholder:text-muted rounded-[2px] focus:ring-1 focus:ring-foreground/10"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex items-center justify-between w-full border border-foreground bg-foreground text-background py-3.5 px-4 font-sans text-[10px] uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50 hover:bg-transparent hover:text-foreground rounded-[2px]"
            >
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              {isSubmitting ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <ArrowRight size={13} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 text-[10px] font-sans text-subtle/60">
            <div className="flex-1 border-t border-border-subtle/40"></div>
            <span className="uppercase tracking-[0.15em]">Or continue with</span>
            <div className="flex-1 border-t border-border-subtle/40"></div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => handleOAuth('google')}
              className="flex items-center justify-center gap-3 w-full border border-border-strong/50 py-3 font-sans text-[12px] text-foreground hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300 rounded-[2px]"
            >
              Google
            </button>
            <button
              onClick={() => handleOAuth('github')}
              className="flex items-center justify-center gap-3 w-full border border-border-strong/50 py-3 font-sans text-[12px] text-foreground hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-300 rounded-[2px]"
            >
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
              className="font-sans text-[10px] uppercase tracking-[0.15em] text-subtle hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-0.5"
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
