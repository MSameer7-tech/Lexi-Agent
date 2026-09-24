import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useHistoryStore } from '../store/historyStore';
import { getConversations } from '../services/lexiAgentApi';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
});

const GUEST_STORAGE_KEY = 'lexiagent-guest-history';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isHydratingRef = useRef(false);

  const hydrateGuest = () => {
    isHydratingRef.current = true;
    useHistoryStore.getState().setIsHydrating(true);
    try {
      const data = localStorage.getItem(GUEST_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        useHistoryStore.getState().setSessions(Array.isArray(parsed.sessions) ? parsed.sessions : []);
        useHistoryStore.getState().setActiveSession(parsed.activeSessionId || null);
      } else {
        useHistoryStore.getState().clearSessions();
      }
    } catch (e) {
      useHistoryStore.getState().clearSessions();
    }
    isHydratingRef.current = false;
    useHistoryStore.getState().setIsHydrating(false);
  };

  const hydrateCloud = async () => {
    isHydratingRef.current = true;
    useHistoryStore.getState().setIsHydrating(true);
    try {
      const res = await getConversations();
      if (res && res.conversations) {
        const cloudSessions = res.conversations.map((c: any) => ({
          id: c.session_id,
          title: c.title,
          preview: c.preview || '',
          isPinned: c.is_pinned || false,
          messages: [],
          isLoaded: false,
          createdAt: c.created_at ? new Date(c.created_at).getTime() : Date.now(),
          updatedAt: c.updated_at ? new Date(c.updated_at).getTime() : Date.now()
        }));
        useHistoryStore.getState().setSessions(cloudSessions, res.hasMore, res.nextCursor);
        
        // Restore active session if it still exists
        const currentActive = useHistoryStore.getState().activeSessionId;
        const savedActive = localStorage.getItem('lexiagent-active-session');
        const activeId = currentActive || savedActive;
        if (activeId && cloudSessions.some((c: any) => c.id === activeId)) {
          useHistoryStore.getState().setActiveSession(activeId);
        } else {
          useHistoryStore.getState().setActiveSession(null);
          localStorage.removeItem('lexiagent-active-session');
        }
      }
    } catch (e) {
      console.error("Failed to hydrate cloud conversations", e);
    }
    isHydratingRef.current = false;
    useHistoryStore.getState().setIsHydrating(false);
  };

  useEffect(() => {
    let initialized = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'INITIAL_SESSION' || !initialized) {
        initialized = true;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          hydrateCloud().finally(() => setIsLoading(false));
        } else {
          hydrateGuest();
          setIsLoading(false);
        }
      } else {
        setSession((prevSession) => {
          if (prevSession?.user?.id !== newSession?.user?.id) {
            if (newSession?.user) {
              hydrateCloud();
            } else {
              hydrateGuest();
            }
          }
          return newSession;
        });
        setUser(newSession?.user ?? null);
        setIsLoading(false);
      }
    });

    // Subscribe to historyStore changes to persist guest data
    const unsub = useHistoryStore.subscribe((state) => {
      if (!isHydratingRef.current) {
        // We only persist to guest local storage if NOT logged in
        supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
          if (!currentSession?.user) {
            localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify({
              sessions: state.sessions,
              activeSessionId: state.activeSessionId
            }));
          } else {
            if (state.activeSessionId) {
              localStorage.setItem('lexiagent-active-session', state.activeSessionId);
            } else {
              localStorage.removeItem('lexiagent-active-session');
            }
          }
        });
      }
    });

    return () => {
      subscription.unsubscribe();
      unsub();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    useHistoryStore.getState().clearSessions();
    hydrateGuest();
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
