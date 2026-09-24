import React, { useState, useEffect } from 'react';
import { Moon, Sun, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // User details
  const email = user?.email || '';
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.display_name || '';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const provider = user?.app_metadata?.provider || 'email';
  
  const displayName = fullName || email.split('@')[0] || 'LexiAgent User';
  const displayProvider = provider === 'email' ? 'Email account' : `${provider.charAt(0).toUpperCase() + provider.slice(1)} account`;

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-2xl px-6 py-12 md:py-20"
    >
      <div className="mb-14">
        <h1 className="font-serif text-[42px] sm:text-5xl text-foreground tracking-tight leading-none">Preferences</h1>
      </div>
      
      <div className="space-y-12">
        {/* ACCOUNT PROFILE */}
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.25em] font-medium text-subtle mb-4 pl-1">Account</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-[20px] bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-border-subtle/50">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-16 h-16 rounded-full border border-border-subtle object-cover shrink-0 bg-surface-tint" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-surface-tint border border-border-subtle flex items-center justify-center text-foreground font-serif text-xl shrink-0">
                {getInitials(displayName)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-serif text-2xl text-foreground mb-1 leading-none">{displayName}</span>
              <span className="font-sans text-[13px] text-muted">{email}</span>
              <span className="font-sans text-[11px] text-subtle mt-2 uppercase tracking-[0.1em]">{displayProvider}</span>
            </div>
          </div>
        </section>

        {/* APPEARANCE */}
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.25em] font-medium text-subtle mb-4 pl-1">Appearance</h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-6 rounded-[20px] bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-border-subtle/50">
            <div>
              <p className="font-serif text-[19px] sm:text-[21px] text-foreground">Theme</p>
              <p className="text-[13px] text-muted mt-1 font-sans">Switch between light and dark modes.</p>
            </div>
            <button 
              onClick={toggleDarkMode}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-background border border-border-strong shadow-sm hover:border-foreground transition-colors shrink-0"
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
              <span className="text-[11px] uppercase tracking-[0.15em] font-medium">{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </section>

        {/* DICTIONARY */}
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.25em] font-medium text-subtle mb-4 pl-1">Dictionary</h2>
          <div className="flex flex-col rounded-[20px] bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-border-subtle/50 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-6 border-b border-border-subtle/30">
              <div>
                <p className="font-serif text-[19px] sm:text-[21px] text-foreground">Pronunciation</p>
                <p className="text-[13px] text-muted mt-1 font-sans">Audio is available on dictionary entries.</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-6">
              <div>
                <p className="font-serif text-[19px] sm:text-[21px] text-foreground">Dictionary Source</p>
              </div>
              <div className="shrink-0 sm:text-right">
                <span className="font-sans text-[11px] uppercase tracking-[0.15em] font-medium text-muted">Merriam-Webster</span>
              </div>
            </div>
          </div>
        </section>

        {/* ACCOUNT ACTIONS */}
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.25em] font-medium text-subtle mb-4 pl-1">Session</h2>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-6 rounded-[20px] bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-border-subtle/50 hover:bg-surface-tint hover:border-border-strong transition-all group"
          >
            <div className="flex flex-col items-start text-left">
              <p className="font-serif text-[19px] sm:text-[21px] text-foreground">Sign out</p>
              <p className="text-[13px] text-muted mt-1 font-sans">Sign out of the current LexiAgent account.</p>
            </div>
            <LogOut size={18} className="text-subtle group-hover:text-foreground transition-colors shrink-0" />
          </button>
        </section>
        
        {/* Spacer for bottom */}
        <div className="h-8"></div>
      </div>
    </motion.div>
  );
};
