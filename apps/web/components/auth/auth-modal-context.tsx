'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AuthModal } from './auth-modal';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';

export type AuthModalMode = 'login' | 'register';

type AuthModalContextValue = {
  openAuth: (mode: AuthModalMode, returnTo?: string) => void;
  closeAuth: () => void;
  switchAuth: (mode: AuthModalMode) => void;
  returnTo: string | null;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return ctx;
}

export function AuthModalProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [mode, setMode] = useState<AuthModalMode | null>(null);
  const [returnTo, setReturnTo] = useState<string | null>(null);

  const openAuth = useCallback((nextMode: AuthModalMode, nextReturnTo?: string) => {
    setReturnTo(nextReturnTo ?? null);
    setMode(nextMode);
  }, []);

  const closeAuth = useCallback(() => {
    setMode(null);
    setReturnTo(null);
  }, []);

  const switchAuth = useCallback((nextMode: AuthModalMode) => {
    setMode(nextMode);
  }, []);

  useEffect(() => {
    function handleOpen(event: Event) {
      const detail = (event as CustomEvent<{ mode?: AuthModalMode; from?: string }>)
        .detail;
      if (detail?.mode === 'login' || detail?.mode === 'register') {
        openAuth(detail.mode, detail.from);
      }
    }

    window.addEventListener('wordnest:auth', handleOpen);
    return () => window.removeEventListener('wordnest:auth', handleOpen);
  }, [openAuth]);

  const value = useMemo(
    () => ({ openAuth, closeAuth, switchAuth, returnTo }),
    [openAuth, closeAuth, switchAuth, returnTo],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {mode ? (
        <AuthModal onClose={closeAuth}>
          {mode === 'register' ? <RegisterForm /> : <LoginForm />}
        </AuthModal>
      ) : null}
    </AuthModalContext.Provider>
  );
}
