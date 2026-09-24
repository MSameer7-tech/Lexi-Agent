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
  const displayProvider = provider === 'email' ? 'Email account' : `${provider} account`;

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-[640px] px-5 py-10 sm:py-16 md:py-20"
    >
      <div className="mb-10 sm:mb-14">
        <h1 className="font-serif text-[40px] sm:text-[46px] text-foreground tracking-tight leading-none">Preferences</h1>
      </div>
      
      <div className="flex flex-col gap-12 sm:gap-14">
        
        {/* ACCOUNT PROFILE */}
        <section>
          <h2 className="text-[9.5px] uppercase tracking-[0.25em] font-medium text-subtle mb-3 sm:mb-4 pl-1">Account</h2>
          <div className="flex items-center gap-5 sm:gap-6 p-6 sm:p-7 rounded-[18px] bg-surface shadow-[0_2px_12px_rgba(42,41,40,0.03)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.15)] border border-border-subtle/40">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] rounded-full border border-border-subtle object-cover shrink-0 bg-surface-tint" />
            ) : (
              <div className="w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] rounded-full bg-surface-tint border border-border-subtle flex items-center justify-center text-foreground font-serif text-xl shrink-0">
                {getInitials(displayName)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-serif text-[22px] sm:text-[24px] text-foreground leading-[1.1]">{displayName}</span>
              <span className="font-sans text-[13px] text-muted mt-1.5">{email}</span>
              <span className="font-sans text-[9px] text-subtle mt-2 uppercase tracking-[0.15em] font-medium">{displayProvider}</span>
            </div>
          </div>
        </section>

        {/* APPEARANCE */}
        <section>
          <h2 className="text-[9.5px] uppercase tracking-[0.25em] font-medium text-subtle mb-3 sm:mb-4 pl-1">Appearance</h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-7 gap-5 rounded-[18px] bg-surface shadow-[0_2px_12px_rgba(42,41,40,0.03)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.15)] border border-border-subtle/40">
            <div>
              <p className="font-serif text-[18px] sm:text-[20px] text-foreground">Theme</p>
              <p className="text-[13px] text-muted mt-1 font-sans">Switch between light and dark modes.</p>
            </div>
            <button 
              onClick={toggleDarkMode}
              className="flex items-center justify-center gap-2.5 px-4 py-2 rounded-[10px] bg-surface-tint border border-border-subtle hover:border-border-strong hover:bg-border-subtle/10 transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
            >
              {isDark ? <Sun size={13} className="text-foreground/80" /> : <Moon size={13} className="text-foreground/80" />}
              <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-foreground/90">
                {isDark ? 'Light' : 'Dark'}
              </span>
            </button>
          </div>
        </section>

        {/* DICTIONARY */}
        <section>
          <h2 className="text-[9.5px] uppercase tracking-[0.25em] font-medium text-subtle mb-3 sm:mb-4 pl-1">Dictionary</h2>
          <div className="flex flex-col rounded-[18px] bg-surface shadow-[0_2px_12px_rgba(42,41,40,0.03)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.15)] border border-border-subtle/40 overflow-hidden">
            
            {/* Row 1 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-7 gap-3 border-b border-border-subtle/30">
              <div className="flex flex-col">
                <span className="font-sans text-[10px] uppercase tracking-[0.15em] font-medium text-foreground/70 mb-1.5">Pronunciation</span>
                <span className="text-[13.5px] text-muted font-sans leading-relaxed">Audio available on dictionary entries.</span>
              </div>
            </div>
            
            {/* Row 2 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-7 gap-3">
              <div className="flex flex-col">
                <span className="font-sans text-[10px] uppercase tracking-[0.15em] font-medium text-foreground/70 mb-1.5">Dictionary Source</span>
              </div>
              <div className="shrink-0 sm:text-right mt-1 sm:mt-0">
                <span className="font-sans text-[11px] uppercase tracking-[0.2em] font-medium text-foreground/90">Merriam-Webster</span>
              </div>
            </div>
            
          </div>
        </section>

        {/* ACCOUNT ACTIONS */}
        <section>
          <h2 className="text-[9.5px] uppercase tracking-[0.25em] font-medium text-subtle mb-3 sm:mb-4 pl-1">Session</h2>
          <button 
            onClick={handleSignOut}
            className="w-full flex flex-row items-center justify-between p-6 sm:p-7 rounded-[18px] bg-surface shadow-[0_2px_12px_rgba(42,41,40,0.03)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.15)] border border-border-subtle/40 hover:bg-surface-tint hover:border-border-strong/60 transition-all group outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
          >
            <div className="flex flex-col items-start text-left">
              <p className="font-serif text-[18px] sm:text-[20px] text-foreground group-hover:text-foreground/80 transition-colors">Sign out</p>
              <p className="text-[13px] text-muted mt-1 font-sans">End your current LexiAgent session.</p>
            </div>
            <LogOut size={16} className="text-subtle group-hover:text-foreground/70 transition-colors shrink-0" />
          </button>
        </section>
        
        {/* Spacer for bottom */}
        <div className="h-4 sm:h-8"></div>
      </div>
    </motion.div>
  );
};
