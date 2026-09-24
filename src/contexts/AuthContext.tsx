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
  };

  const hydrateCloud = async () => {
    isHydratingRef.current = true;
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
        useHistoryStore.getState().setSessions(cloudSessions);
        // We don't restore active session from cloud automatically to keep it clean
        useHistoryStore.getState().setActiveSession(null);
      }
    } catch (e) {
      console.error("Failed to hydrate cloud conversations", e);
    }
    isHydratingRef.current = false;
  };

  useEffect(() => {
    // Initial load
    supabase.auth.getSession().then(({ data: { session: authSession } }) => {
      setSession(authSession);
      setUser(authSession?.user ?? null);
      
      if (authSession?.user) {
        hydrateCloud().finally(() => setIsLoading(false));
      } else {
        hydrateGuest();
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
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
