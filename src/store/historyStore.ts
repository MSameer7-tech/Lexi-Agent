import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, Message } from '../types';

interface HistoryState {
  sessions: Session[];
  activeSessionId: string | null;
  isDrawerOpen: boolean;
  
  // Actions
  setDrawerOpen: (isOpen: boolean) => void;
  setActiveSession: (id: string | null) => void;
  addSession: (session: Session) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  togglePin: (id: string) => void;
  addMessageToSession: (sessionId: string, message: Message) => void;
}

// Mock initial data to populate the drawer for design purposes
const MOCK_SESSIONS: Session[] = [
  {
    id: 'mock-1',
    title: 'Pragmatic examples',
    preview: 'Can you give me another example of being pragmatic?',
    topic: 'pragmatic',
    isPinned: true,
    messages: [],
    createdAt: Date.now() - 1000 * 60 * 30, // 30 mins ago
    updatedAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'mock-2',
    title: 'Understanding serendipity',
    preview: 'What exactly does serendipity mean in literature?',
    topic: 'serendipity',
    isPinned: false,
    messages: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'mock-3',
    title: 'Words for describing precision',
    preview: 'I need synonyms for meticulous and careful.',
    topic: 'meticulous',
    isPinned: false,
    messages: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 25, // 1 day ago
    updatedAt: Date.now() - 1000 * 60 * 60 * 25,
  }
];

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      sessions: MOCK_SESSIONS,
      activeSessionId: null,
      isDrawerOpen: false,

      setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),
      
      setActiveSession: (id) => set({ activeSessionId: id }),
      
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

      addMessageToSession: (sessionId, message) => set((state) => {
        const sessionExists = state.sessions.some(s => s.id === sessionId);
        
        if (!sessionExists) {
          // If session doesn't exist, we rely on addSession being called first.
          // This is a safety check.
          return state;
        }

        return {
          sessions: state.sessions.map((s) => {
            if (s.id === sessionId) {
              const newMessages = [...s.messages, message];
              // Auto-generate title and preview from first user message if not set
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
    }),
    {
      name: 'lexiagent-history',
      partialize: (state) => ({ sessions: state.sessions }) // Only persist sessions
    }
  )
);
