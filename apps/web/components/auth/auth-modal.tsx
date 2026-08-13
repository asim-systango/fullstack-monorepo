'use client';

import { useEffect, type ReactNode } from 'react';

type AuthModalProps = {
  children: ReactNode;
  onClose: () => void;
};

export function AuthModal({ children, onClose }: Readonly<AuthModalProps>) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close"
        onClick={onClose}
      />
      <dialog
        open
        aria-labelledby="auth-modal-title"
        className="relative z-10 m-0 max-h-[min(92vh,44rem)] w-full max-w-[32.5rem] overflow-y-auto rounded-md border-0 bg-background px-8 py-12 shadow-[0_4px_24px_rgba(0,0,0,0.18)] sm:px-12 sm:py-14"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
        {children}
      </dialog>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function AuthFooterLink({
  prompt,
  linkText,
  onClick,
}: Readonly<{ prompt: string; linkText: string; onClick: () => void }>) {
  return (
    <p className="mt-8 text-center text-sm text-muted-foreground">
      {prompt}{' '}
      <button
        type="button"
        onClick={onClick}
        className="text-foreground underline underline-offset-2 hover:no-underline"
      >
        {linkText}
      </button>
    </p>
  );
}

export function AuthLegalText() {
  return (
    <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
      By clicking &ldquo;Sign up&rdquo;, you accept Wordnest&apos;s{' '}
      <span className="underline underline-offset-2">Terms of Service</span> and{' '}
      <span className="underline underline-offset-2">Privacy Policy</span>.
    </p>
  );
}
