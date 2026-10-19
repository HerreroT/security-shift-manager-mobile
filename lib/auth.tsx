import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { api, setAuthToken, setUnauthorizedHandler } from '@/lib/api';
import type { LoginResponse } from '@/types/api';

const SESSION_KEY = 'session';

export type Session = {
  token: string;
  username: string;
  email: string;
};

type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// expo-secure-store is not available on web, where localStorage is used instead.
const storage = {
  get: async (key: string) =>
    Platform.OS === 'web' ? globalThis.localStorage?.getItem(key) ?? null : SecureStore.getItemAsync(key),
  set: async (key: string, value: string) =>
    Platform.OS === 'web' ? globalThis.localStorage?.setItem(key, value) : SecureStore.setItemAsync(key, value),
  remove: async (key: string) =>
    Platform.OS === 'web' ? globalThis.localStorage?.removeItem(key) : SecureStore.deleteItemAsync(key),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setSession(null);
    await storage.remove(SESSION_KEY);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
    storage
      .get(SESSION_KEY)
      .then((stored) => {
        if (stored) {
          const parsed = JSON.parse(stored) as Session;
          setAuthToken(parsed.token);
          setSession(parsed);
        }
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    const newSession: Session = { token: response.token, username: response.username, email: response.email };
    await storage.set(SESSION_KEY, JSON.stringify(newSession));
    setAuthToken(newSession.token);
    setSession(newSession);
  }, []);

  const value = useMemo(() => ({ session, isLoading, signIn, signOut }), [session, isLoading, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
