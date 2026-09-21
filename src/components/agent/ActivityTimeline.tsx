import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

export type AgentEventStatus = 'pending' | 'success' | 'error';

export interface AgentEvent {
  id: string;
  label: string;
  timestamp?: number;
  status: AgentEventStatus;
  details?: string; // we ignore this to not expose CoT
}

interface ActivityTimelineProps {
  events: AgentEvent[];
  className?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!events || events.length === 0) return null;

  return (
    <div className={cn("w-full mb-8", className)}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-subtle hover:text-foreground transition-colors group"
      >
        <Zap size={10} className="text-subtle group-hover:text-foreground transition-colors" />
        <span className="font-sans text-[9px] uppercase tracking-widest font-medium">Agent Activity</span>
        {isExpanded ? <ChevronUp size={12} strokeWidth={1.5} /> : <ChevronDown size={12} strokeWidth={1.5} />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 mt-4 pl-1">
              {events.map((event) => (
                <div key={event.id} className="flex items-center gap-3">
                  <Check size={12} strokeWidth={2} className="text-muted" />
                  <span className="font-sans text-[12px] text-muted">{event.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
