import { create } from 'zustand';
import type { Session, Message } from '../types';

interface HistoryState {
  sessions: Session[];
  activeSessionId: string | null;
  isDrawerOpen: boolean;
  
  hasMore: boolean;
  nextCursor: any;
  searchQuery: string;
  
  // Actions
  setDrawerOpen: (isOpen: boolean) => void;
  setActiveSession: (id: string | null) => void;
  setSessions: (sessions: Session[], hasMore?: boolean, nextCursor?: any) => void;
  appendSessions: (sessions: Session[], hasMore: boolean, nextCursor: any) => void;
  setSearchQuery: (query: string) => void;
  
  addSession: (session: Session) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  togglePin: (id: string) => void;
  
  addMessageToSession: (sessionId: string, message: Message) => void;
  setMessages: (sessionId: string, messages: Message[], hasMore?: boolean, nextCursor?: any) => void;
  prependMessages: (sessionId: string, messages: Message[], hasMore: boolean, nextCursor: any) => void;
  clearSessions: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  sessions: [],
  activeSessionId: null,
  isDrawerOpen: false,
  hasMore: false,
  nextCursor: null,
  searchQuery: '',

  setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
  
  setActiveSession: (id) => set({ activeSessionId: id }),
  
  setSessions: (sessions, hasMore = false, nextCursor = null) => set({ sessions, hasMore, nextCursor }),
  
  appendSessions: (newSessions, hasMore, nextCursor) => set((state) => {
    // Deduplicate
    const existingIds = new Set(state.sessions.map(s => s.id));
    const filtered = newSessions.filter(s => !existingIds.has(s.id));
    return { sessions: [...state.sessions, ...filtered], hasMore, nextCursor };
  }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

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

  clearSessions: () => set({ sessions: [], activeSessionId: null, hasMore: false, nextCursor: null }),

  prependMessages: (sessionId, oldMessages, hasMoreMessages, nextMessageCursor) => set((state) => ({
    sessions: state.sessions.map(s => {
      if (s.id === sessionId) {
        // Deduplicate messages
        const existingIds = new Set(s.messages.map(m => m.id));
        const filtered = oldMessages.filter(m => !existingIds.has(m.id));
        return { ...s, messages: [...filtered, ...s.messages], hasMoreMessages, nextMessageCursor };
      }
      return s;
    })
  })),


  setMessages: (sessionId, messages, hasMoreMessages = false, nextMessageCursor = null) => set((state) => ({
    sessions: state.sessions.map(s => 
      s.id === sessionId ? { ...s, messages, isLoaded: true, hasMoreMessages, nextMessageCursor } : s
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
