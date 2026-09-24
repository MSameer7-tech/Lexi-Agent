import { create } from 'zustand';
import type { Session, Message } from '../types';

interface HistoryState {
  sessions: Session[];
  activeSessionId: string | null;
  isDrawerOpen: boolean;
  
  // Actions
  setDrawerOpen: (isOpen: boolean) => void;
  setActiveSession: (id: string | null) => void;
  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  togglePin: (id: string) => void;
  addMessageToSession: (sessionId: string, message: Message) => void;
  setMessages: (sessionId: string, messages: Message[]) => void;
  clearSessions: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  sessions: [],
  activeSessionId: null,
  isDrawerOpen: false,

  setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
  
  setActiveSession: (id) => set({ activeSessionId: id }),
  
  setSessions: (sessions) => set({ sessions }),

  addSession: (session) => set((state) => ({ 
    sessions: [session, ...state.sessions] 
  })),
  
  updateSession: (id, updates) => set((state) => ({
    sessions: state.sessions.map((s) => 
      s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
    )
  })),
  
  deleteSession: (id) => set((state) => ({
    sessions: state.sessions.filter((s) => s.id !== id),
    activeSessionId: state.activeSessionId === id ? null : state.activeSessionId
  })),
  
  togglePin: (id) => set((state) => ({
    sessions: state.sessions.map((s) =>
      s.id === id ? { ...s, isPinned: !s.isPinned } : s
    )
  })),

  clearSessions: () => set({ sessions: [], activeSessionId: null }),

  setMessages: (sessionId, messages) => set((state) => ({
    sessions: state.sessions.map(s => 
      s.id === sessionId ? { ...s, messages, isLoaded: true } : s
    )
  })),

  addMessageToSession: (sessionId, message) => set((state) => {
    const sessionExists = state.sessions.some(s => s.id === sessionId);
    if (!sessionExists) return state;

    return {
      sessions: state.sessions.map((s) => {
        if (s.id === sessionId) {
          const newMessages = [...s.messages, message];
          const firstUserMsg = newMessages.find(m => m.role === 'user');
          const title = s.title || (firstUserMsg ? firstUserMsg.content.slice(0, 40) + '...' : 'New Conversation');
          const preview = firstUserMsg ? firstUserMsg.content : '';
          
          return {
            ...s,
            messages: newMessages,
            title,
            preview,
            updatedAt: Date.now()
          };
        }
        return s;
      })
    };
  })
}));
