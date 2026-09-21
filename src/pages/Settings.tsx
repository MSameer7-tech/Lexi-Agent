import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

export const Settings: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-4xl px-6 py-12 md:py-20"
    >
      <div className="flex items-center gap-4 mb-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-tint border border-border-subtle text-foreground">
          <SettingsIcon size={20} strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-5xl text-foreground tracking-tight">Preferences</h1>
      </div>
      
      <div className="space-y-8">
        <div className="rounded-2xl bg-surface p-8 shadow-subtle border border-border-subtle">
          <h2 className="text-sm uppercase tracking-widest font-medium text-subtle mb-6">Appearance</h2>
          
          <div className="flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-surface-tint">
            <div>
              <p className="font-medium text-foreground text-lg">Theme</p>
              <p className="text-sm text-muted mt-1">Switch between light and dark modes.</p>
            </div>
            <button 
              onClick={toggleDarkMode}
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-surface border border-border-strong shadow-subtle hover:border-foreground transition-colors"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              <span className="text-sm font-medium">{isDark ? 'Light' : 'Dark'} Mode</span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-8 shadow-subtle border border-border-subtle">
          <h2 className="text-sm uppercase tracking-widest font-medium text-subtle mb-6">Agent Configuration</h2>
          <div className="p-6 rounded-xl border border-border-subtle bg-surface-tint border-dashed">
            <p className="text-muted font-serif italic text-lg text-center">
              Awaiting n8n connection details.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
