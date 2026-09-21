import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, AlertCircle, ChevronDown, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

export type AgentEventStatus = 'pending' | 'success' | 'error';

export interface AgentEvent {
  id: string;
  label: string;
  timestamp?: number;
  status: AgentEventStatus;
  details?: string;
}

interface ActivityTimelineProps {
  events: AgentEvent[];
  className?: string;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ events, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!events || events.length === 0) return null;

  const isAllSuccess = events.every(e => e.status === 'success');
  const hasError = events.some(e => e.status === 'error');
  
  let summaryText = 'Agent Activity';
  if (hasError) summaryText = 'Agent Error';
  else if (!isAllSuccess) summaryText = 'Agent Processing...';

  const formatTime = (ts?: number) => {
    if (!ts) return '';
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(ts);
  };

  return (
    <div className={cn("w-full max-w-sm rounded-2xl bg-surface border border-border-subtle shadow-sm overflow-hidden", className)}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-tint transition-colors"
      >
        <div className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest font-medium text-muted">
          <Activity size={14} className={cn(!isAllSuccess && !hasError && "animate-pulse text-foreground")} />
          <span>{summaryText}</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} className="text-subtle" />
        </motion.div>
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
            <div className="px-4 pb-4 pt-1 flex flex-col gap-0">
              {events.map((event, index) => {
                const isLast = index === events.length - 1;
                
                return (
                  <div key={event.id} className="flex gap-4 relative">
                    {/* Timeline vertical line */}
                    {!isLast && (
                      <div className="absolute left-2.5 top-6 bottom-[-8px] w-[1px] bg-border-subtle" />
                    )}
                    
                    {/* Status Indicator */}
                    <div className="relative z-10 flex flex-col items-center mt-1.5 shrink-0">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center bg-surface",
                        event.status === 'success' ? 'text-[var(--color-sage)]' : 
                        event.status === 'error' ? 'text-red-500' : 
                        'text-foreground'
                      )}>
                        {event.status === 'success' ? (
                          <Check size={14} strokeWidth={2.5} />
                        ) : event.status === 'error' ? (
                          <AlertCircle size={14} strokeWidth={2} />
                        ) : (
                          <Loader2 size={14} className="animate-spin" strokeWidth={2} />
                        )}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-4 pt-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className={cn(
                          "font-sans text-sm",
                          event.status === 'pending' ? "text-foreground font-medium" : "text-subtle"
                        )}>
                          {event.label}
                        </span>
                        {event.timestamp && (
                          <span className="text-[10px] text-border-strong font-medium tracking-wide">
                            {formatTime(event.timestamp)}
                          </span>
                        )}
                      </div>
                      
                      {event.details && (
                        <div className="mt-2 text-xs text-muted font-sans bg-surface-tint p-2 rounded-md border border-border-subtle">
                          {event.details}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
