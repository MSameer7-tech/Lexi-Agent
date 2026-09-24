import React, { useState, useEffect } from 'react';
import { Moon, Sun, LogOut, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../lib/motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useHistoryStore } from '../store/historyStore';

export const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);
  
  const [counts, setCounts] = useState({ conversations: 0, saved: 0, explored: 0 });
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    if (user) {
      const fetchCounts = async () => {
        try {
          const [conv, saved, explored] = await Promise.all([
            supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('saved_words').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('word_history').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
          ]);
          setCounts({
            conversations: conv.count || 0,
            saved: saved.count || 0,
            explored: explored.count || 0,
          });
        } catch (err) {
          console.error("Failed to fetch counts:", err);
        } finally {
          setLoadingCounts(false);
        }
      };
      fetchCounts();
    } else {
      // Guest mode
      const sessions = useHistoryStore.getState().sessions;
      setCounts({
        conversations: sessions.length,
        saved: 0,
        explored: 0,
      });
      setLoadingCounts(false);
    }
  }, [user]);

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
  
  const displayName = fullName || email.split('@')[0] || (user ? 'LexiAgent User' : 'Guest User');
  const displayProvider = user ? (provider === 'email' ? 'Email account' : `${provider} account`) : 'Local Session';

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <motion.div 
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="mx-auto w-full max-w-[960px] px-5 py-10 sm:py-16 md:py-20"
    >
      <motion.div variants={staggerItem} className="mb-10 sm:mb-14">
        <h1 className="font-serif text-[40px] sm:text-[46px] text-foreground tracking-tight leading-none">Preferences</h1>
      </motion.div>
      
      {/* TWO COLUMN GRID FOR DESKTOP */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-10 lg:gap-14">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-10 lg:gap-14">
          
          {/* ACCOUNT PROFILE */}
          <motion.section variants={staggerItem}>
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
                <span className="font-serif text-[22px] sm:text-[24px] text-foreground leading-[1.1] truncate max-w-[200px] sm:max-w-[240px]">{displayName}</span>
                <span className="font-sans text-[13px] text-muted mt-1.5 truncate max-w-[200px] sm:max-w-[240px]">{email}</span>
                <span className="font-sans text-[9px] text-subtle mt-2.5 uppercase tracking-[0.15em] font-medium">{displayProvider}</span>
              </div>
            </div>
          </motion.section>

          {/* APPEARANCE */}
          <motion.section variants={staggerItem}>
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
          </motion.section>

        </div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-10 lg:gap-14">

          {/* YOUR LEXIAGENT */}
          <motion.section variants={staggerItem}>
            <h2 className="text-[9.5px] uppercase tracking-[0.25em] font-medium text-subtle mb-3 sm:mb-4 pl-1">Your LexiAgent</h2>
            <div className="flex flex-col justify-center p-6 sm:p-7 rounded-[18px] bg-surface shadow-[0_2px_12px_rgba(42,41,40,0.03)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.15)] border border-border-subtle/40">
              {loadingCounts ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={18} className="animate-spin text-subtle" />
                </div>
              ) : (
                <div className="flex flex-col h-full justify-between py-1">
                  <div className="flex items-start gap-12">
                    <div className="flex flex-col">
                      <span className="font-serif text-[26px] sm:text-[30px] text-foreground leading-none mb-1.5">{counts.conversations}</span>
                      <span className="font-sans text-[9px] uppercase tracking-[0.15em] font-medium text-muted">Conversations</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif text-[26px] sm:text-[30px] text-foreground leading-none mb-1.5">{counts.saved}</span>
                      <span className="font-sans text-[9px] uppercase tracking-[0.15em] font-medium text-muted">Saved Words</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col mt-5">
                    <span className="font-serif text-[26px] sm:text-[30px] text-foreground leading-none mb-1.5">{counts.explored}</span>
                    <span className="font-sans text-[9px] uppercase tracking-[0.15em] font-medium text-muted">Words Explored</span>
                  </div>
                </div>
              )}
            </div>
          </motion.section>

          {/* DICTIONARY */}
          <motion.section variants={staggerItem}>
            <h2 className="text-[9.5px] uppercase tracking-[0.25em] font-medium text-subtle mb-3 sm:mb-4 pl-1">Dictionary</h2>
            <div className="flex flex-col rounded-[18px] bg-surface shadow-[0_2px_12px_rgba(42,41,40,0.03)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.15)] border border-border-subtle/40 overflow-hidden">
              
              {/* Row 1 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-7 gap-3 border-b border-border-subtle/30">
                <div className="flex flex-col">
                  <span className="font-sans text-[10px] uppercase tracking-[0.15em] font-medium text-foreground/70 mb-1.5">Pronunciation</span>
                  <span className="text-[13px] text-muted font-sans leading-relaxed">Audio available on dictionary entries.</span>
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
          </motion.section>

        </div>
      </div>

      {/* ACCOUNT ACTIONS (FULL WIDTH AT BOTTOM) */}
      <div className="mt-10 lg:mt-14">
        <motion.section variants={staggerItem}>
          <h2 className="text-[9.5px] uppercase tracking-[0.25em] font-medium text-subtle mb-3 sm:mb-4 pl-1">Session</h2>
          <button 
            onClick={handleSignOut}
            className="w-full flex flex-row items-center justify-between p-6 sm:p-7 rounded-[18px] bg-surface shadow-[0_2px_12px_rgba(42,41,40,0.03)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.15)] border border-border-subtle/40 hover:bg-surface-tint hover:border-border-strong/60 transition-all group outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
          >
            <div className="flex flex-col items-start text-left">
              <p className="font-serif text-[18px] sm:text-[20px] text-foreground group-hover:text-foreground/80 transition-colors">Sign out</p>
              <p className="text-[13px] text-muted mt-1 font-sans">End your current LexiAgent session.</p>
            </div>
            <LogOut size={18} className="text-subtle group-hover:text-foreground/70 transition-colors shrink-0 group-hover:translate-x-1 duration-300" />
          </button>
        </motion.section>
      </div>
      
      {/* Spacer for bottom */}
      <div className="h-4 sm:h-8"></div>
    </motion.div>
  );
};
