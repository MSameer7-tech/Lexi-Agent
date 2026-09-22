import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';

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
      setAuthError(error.message || `An error occurred with ${provider} sign-in.`);
    }
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center p-6 min-h-[70vh]">
      <div className="w-full max-w-[400px] flex flex-col gap-8 border border-border-subtle p-10 bg-background dark:bg-card">
        
        <div className="flex flex-col gap-2">
          <h1 className="font-serif text-3xl font-medium text-foreground tracking-tight">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="font-sans text-sm text-subtle">
            {isLogin ? 'Sign in to sync your lexicon.' : 'Join LexiAgent to save your history.'}
          </p>
        </div>

        {authError && (
          <div className="font-sans text-xs text-red-500 bg-red-500/10 p-3 rounded-none border border-red-500/20">
            {authError}
          </div>
        )}
        
        {message && (
          <div className="font-sans text-xs text-green-600 bg-green-500/10 p-3 rounded-none border border-green-500/20">
            {message}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent font-sans text-sm border-b border-border-subtle focus:border-foreground py-2 outline-none transition-colors text-foreground placeholder:text-muted"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent font-sans text-sm border-b border-border-subtle focus:border-foreground py-2 outline-none transition-colors text-foreground placeholder:text-muted"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex items-center justify-between w-full border border-foreground bg-foreground text-background py-3 px-4 font-sans text-[11px] uppercase tracking-widest hover:bg-transparent hover:text-foreground transition-all duration-300 disabled:opacity-50"
          >
            <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            )}
          </button>
        </form>

        <div className="flex items-center gap-4 text-xs font-sans text-muted">
          <div className="flex-1 border-t border-border-subtle"></div>
          <span className="uppercase tracking-widest text-[9px]">Or continue with</span>
          <div className="flex-1 border-t border-border-subtle"></div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleOAuth('google')}
            className="flex items-center justify-center gap-3 w-full border border-border-strong py-3 font-sans text-xs text-foreground hover:bg-foreground hover:text-background transition-colors duration-300"
          >
            Google
          </button>
          <button
            onClick={() => handleOAuth('github')}
            className="flex items-center justify-center gap-3 w-full border border-border-strong py-3 font-sans text-xs text-foreground hover:bg-foreground hover:text-background transition-colors duration-300"
          >
            GitHub
          </button>
        </div>

        <div className="text-center mt-2">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setAuthError('');
              setMessage('');
            }}
            className="font-sans text-[11px] uppercase tracking-widest text-muted hover:text-foreground transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};
