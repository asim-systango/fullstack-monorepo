'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Alert } from '@shared/ui/components';

type ToastTone = 'success' | 'danger' | 'info';
type Toast = { id: number; tone: ToastTone; message: string };
type ShowToast = (message: string, tone?: ToastTone) => void;

const TOAST_MS = 4000;
const MAX_TOASTS = 3;
const ToastContext = createContext<ShowToast>(() => undefined);

function withoutToast(list: Toast[], id: number) {
  return list.filter((toast) => toast.id !== id);
}

// the ui kit has no toast, so this is a small one built on Alert
export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => withoutToast(list, id));
  }, []);

  const show = useCallback<ShowToast>(
    (message, tone = 'success') => {
      lastId.current += 1;
      const id = lastId.current;
      // keep only the newest few so a burst of actions doesn't fill the screen
      setToasts((list) => [...list, { id, tone, message }].slice(-MAX_TOASTS));
      window.setTimeout(() => dismiss(id), TOAST_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 bottom-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <Alert key={toast.id} tone={toast.tone} className="shadow-md">
            {toast.message}
          </Alert>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
