import React from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const History: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-4xl px-6 py-12 md:py-20"
    >
      <div className="flex items-center gap-4 mb-16">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-tint border border-border-subtle text-foreground">
          <Clock size={20} strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-5xl text-foreground tracking-tight">Timeline</h1>
      </div>
      
      <div className="rounded-2xl bg-surface p-16 text-center shadow-subtle border border-border-subtle relative overflow-hidden">
        <div className="absolute top-0 left-0 w-40 h-40 bg-accent opacity-20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <p className="text-muted italic font-serif text-2xl mb-4">A record of your linguistic journey.</p>
        <p className="text-subtle font-sans">This feature will sync with your session history soon.</p>
      </div>
    </motion.div>
  );
};
