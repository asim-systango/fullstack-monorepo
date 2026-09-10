'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Check, X, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, message, title }: Omit<ToastMessage, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message, title }]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast],
  );

  const success = useCallback(
    (message: string, title = 'Success') => showToast({ type: 'success', message, title }),
    [showToast],
  );
  const error = useCallback(
    (message: string, title = 'Error') => showToast({ type: 'error', message, title }),
    [showToast],
  );
  const info = useCallback(
    (message: string, title = 'Notice') => showToast({ type: 'info', message, title }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}

      {/* Floating Toast Notification Stack Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-5 ${
              toast.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-950/90 text-emerald-100 shadow-emerald-950/20'
                : toast.type === 'error'
                ? 'border-rose-500/40 bg-rose-950/90 text-rose-100 shadow-rose-950/20'
                : 'border-blue-500/40 bg-slate-900/90 text-slate-100 shadow-slate-950/20'
            }`}
          >
            <div className="flex-1 space-y-1">
              <h5 className="text-xs font-bold tracking-wide uppercase flex items-center gap-1.5">
                {toast.type === 'success' ? (
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : toast.type === 'error' ? (
                  <X className="h-4 w-4 text-rose-400 shrink-0" />
                ) : (
                  <Info className="h-4 w-4 text-blue-400 shrink-0" />
                )}
                <span>{toast.title}</span>
              </h5>
              <p className="text-xs leading-relaxed opacity-90">{toast.message}</p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-xs opacity-60 hover:opacity-100 transition-opacity p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
