'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastItem = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
};

type ToastListener = () => void;

let counter = 0;
let toasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

const toastStore = {
  subscribe(listener: ToastListener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return toasts;
  },
};

export const toast = {
  show: (type: ToastType, message: string, title?: string, duration = 5000): string => {
    counter += 1;
    const id = `toast-${Date.now().toString(36)}-${counter}`;
    toasts = [...toasts, { id, type, message, title, duration }];
    emitChange();

    if (duration > 0) {
      setTimeout(() => {
        toast.dismiss(id);
      }, duration);
    }
    return id;
  },
  success: (message: string, title = 'Success', duration = 5000) => {
    return toast.show('success', message, title, duration);
  },
  error: (message: string, title = 'Error', duration = 6000) => {
    return toast.show('error', message, title, duration);
  },
  warning: (message: string, title = 'Warning', duration = 5000) => {
    return toast.show('warning', message, title, duration);
  },
  info: (message: string, title = 'Information', duration = 5000) => {
    return toast.show('info', message, title, duration);
  },
  dismiss: (id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    emitChange();
  },
  clear: () => {
    toasts = [];
    emitChange();
  },
};

export function Toaster() {
  const currentToasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    () => [] as ToastItem[], // server snapshot — always empty
  );

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-5 right-5 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none sm:max-w-md"
    >
      {currentToasts.map((t) => (
        <ToastCard key={t.id} item={t} onDismiss={() => toast.dismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({
  item,
  onDismiss,
}: Readonly<{
  item: ToastItem;
  onDismiss: () => void;
}>) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const getStyle = () => {
    switch (item.type) {
      case 'error':
        return {
          border: 'border-rose-500/40 dark:border-rose-500/50',
          bg: 'bg-rose-50 dark:bg-rose-950/90 text-rose-950 dark:text-rose-100',
          icon: '❌',
        };
      case 'success':
        return {
          border: 'border-emerald-500/40 dark:border-emerald-500/50',
          bg: 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-950 dark:text-emerald-100',
          icon: '✅',
        };
      case 'warning':
        return {
          border: 'border-amber-500/40 dark:border-amber-500/50',
          bg: 'bg-amber-50 dark:bg-amber-950/90 text-amber-950 dark:text-amber-100',
          icon: '⚠️',
        };
      default:
        return {
          border: 'border-[#7DA0FA]/50',
          bg: 'bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white',
          icon: 'ℹ️',
        };
    }
  };

  const style = getStyle();

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border-2 shadow-xl backdrop-blur-md transition-all duration-300 transform ${
        style.border
      } ${style.bg} ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-sm shadow-2xs">
        <span>{style.icon}</span>
      </div>

      <div className="flex-1 min-w-0 pt-0.5 space-y-0.5">
        {item.title && (
          <div className="text-xs font-black uppercase tracking-wider opacity-90">
            {item.title}
          </div>
        )}
        <div className="text-sm font-semibold leading-snug break-words">
          {item.message}
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
        aria-label="Close notification"
      >
        <span className="text-sm font-bold">×</span>
      </button>
    </div>
  );
}
