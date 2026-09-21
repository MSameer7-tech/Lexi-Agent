import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Pin, Trash2, Edit2, MessageSquare, Clock } from 'lucide-react';
import { isToday, isYesterday, isThisWeek, formatDistanceToNow } from 'date-fns';
import { useHistoryStore } from '../../store/historyStore';
import { cn } from '../../lib/utils';
import type { Session } from '../../types';

export const HistoryDrawer: React.FC = () => {
  const { isDrawerOpen, setDrawerOpen, sessions, activeSessionId, setActiveSession, togglePin, deleteSession, updateSession } = useHistoryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Filter and group sessions
  const groupedSessions = useMemo(() => {
    let filtered = sessions;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = sessions.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.topic?.toLowerCase().includes(q) ||
        s.preview?.toLowerCase().includes(q)
      );
    }

    const pinned = filtered.filter(s => s.isPinned);
    const unpinned = filtered.filter(s => !s.isPinned);

    const today = unpinned.filter(s => isToday(s.updatedAt));
    const yesterday = unpinned.filter(s => isYesterday(s.updatedAt));
    const previous7Days = unpinned.filter(s => isThisWeek(s.updatedAt) && !isToday(s.updatedAt) && !isYesterday(s.updatedAt));
    const older = unpinned.filter(s => !isToday(s.updatedAt) && !isYesterday(s.updatedAt) && !isThisWeek(s.updatedAt));

    return { pinned, today, yesterday, previous7Days, older };
  }, [sessions, searchQuery]);

  const handleRenameSubmit = (id: string) => {
    if (editTitle.trim()) {
      updateSession(id, { title: editTitle.trim() });
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') handleRenameSubmit(id);
    if (e.key === 'Escape') setEditingId(null);
  };

  const renderSessionItem = (session: Session) => {
    const isActive = activeSessionId === session.id;
    const isEditing = editingId === session.id;

    return (
      <motion.div 
        layout
        key={session.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer",
          isActive 
            ? "bg-foreground text-background border-foreground shadow-elevated" 
            : "bg-surface hover:bg-surface-tint border-transparent hover:border-border-subtle"
        )}
        onClick={() => {
          if (!isEditing) {
            setActiveSession(session.id);
            if (window.innerWidth < 1024) setDrawerOpen(false); // Close on mobile after select
          }
        }}
      >
        <div className="flex justify-between items-start mb-2">
          {isEditing ? (
            <input
              autoFocus
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onBlur={() => handleRenameSubmit(session.id)}
              onKeyDown={(e) => handleKeyDown(e, session.id)}
              className="font-serif text-lg bg-transparent border-b border-foreground focus:outline-none w-full mr-4"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <h4 className={cn(
              "font-serif text-lg leading-tight line-clamp-1 pr-4 transition-colors",
              isActive ? "text-background" : "text-foreground group-hover:text-foreground"
            )}>
              {session.title}
            </h4>
          )}

          {session.topic && !isEditing && (
            <span className={cn(
              "text-[10px] uppercase tracking-widest font-medium px-2 py-1 rounded-md shrink-0",
              isActive ? "bg-background/20 text-background" : "bg-[var(--color-peach)]/30 text-[#8A5A44] dark:bg-[var(--color-peach)]/10 dark:text-[var(--color-peach)]"
            )}>
              {session.topic}
            </span>
          )}
        </div>

        {!isEditing && (
          <p className={cn(
            "text-sm font-sans line-clamp-2 mb-4 transition-colors",
            isActive ? "text-background/80" : "text-subtle"
          )}>
            {session.preview || "Empty conversation"}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto">
          <span className={cn(
            "text-xs flex items-center gap-1 transition-colors",
            isActive ? "text-background/60" : "text-muted"
          )}>
            <Clock size={12} />
            {formatDistanceToNow(session.updatedAt, { addSuffix: true })}
          </span>

          <div className={cn(
            "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isActive ? "text-background/80" : "text-muted"
          )}>
            <button 
              onClick={(e) => { e.stopPropagation(); togglePin(session.id); }}
              className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"
              title={session.isPinned ? "Unpin" : "Pin"}
            >
              <Pin size={14} className={session.isPinned ? "fill-current" : ""} />
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                setEditingId(session.id);
                setEditTitle(session.title);
              }}
              className="p-1.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"
              title="Rename"
            >
              <Edit2 size={14} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
              className="p-1.5 hover:bg-red-500/20 hover:text-red-500 rounded-md transition-colors"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderGroup = (title: string, groupSessions: Session[]) => {
    if (groupSessions.length === 0) return null;
    return (
      <div className="mb-8">
        <h3 className="text-xs uppercase tracking-widest font-semibold text-subtle mb-4 flex items-center gap-2">
          {title === 'Pinned' && <Pin size={12} className="fill-current" />}
          {title}
        </h3>
        <div className="flex flex-col gap-3">
          {groupSessions.map(renderSessionItem)}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 lg:hidden"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-surface-tint border-l border-border-subtle shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-border-subtle flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-foreground text-background rounded-lg">
                  <MessageSquare size={18} strokeWidth={2} />
                </div>
                <h2 className="font-serif text-2xl text-foreground tracking-tight">History</h2>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-full hover:bg-surface border border-transparent hover:border-border-strong text-muted hover:text-foreground transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="p-6 pb-2">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-surface border border-border-subtle focus:border-foreground focus:ring-1 focus:ring-foreground transition-all text-sm font-sans placeholder:text-subtle"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
              {sessions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                  <Clock size={48} className="mb-4 text-muted" strokeWidth={1} />
                  <p className="font-serif text-xl text-foreground mb-2">No history yet</p>
                  <p className="font-sans text-sm text-subtle">Your conversational explorations will appear here.</p>
                </div>
              ) : (
                <div className="pb-20">
                  {renderGroup('Pinned', groupedSessions.pinned)}
                  {renderGroup('Today', groupedSessions.today)}
                  {renderGroup('Yesterday', groupedSessions.yesterday)}
                  {renderGroup('Previous 7 Days', groupedSessions.previous7Days)}
                  {renderGroup('Older', groupedSessions.older)}
                </div>
              )}
            </div>

            {/* Create New Button (Optional, if they want to start a new chat from here) */}
            <div className="absolute bottom-6 left-6 right-6">
              <button 
                onClick={() => {
                  setActiveSession(null);
                  setDrawerOpen(false);
                }}
                className="w-full py-4 rounded-xl bg-foreground text-background font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-elevated"
              >
                Start New Exploration
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
