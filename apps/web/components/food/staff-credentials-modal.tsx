'use client';

import { Copy } from 'lucide-react';
import type { StaffLoginDetails } from '@/lib/types/food-delivery';
import { toastSuccess } from '@/lib/toast';

type StaffCredentialsModalProps = Readonly<{
  open: boolean;
  restaurantName: string;
  staffLogin: StaffLoginDetails | null;
  onClose: () => void;
}>;

async function copyText(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    toastSuccess(`${label} copied`);
  } catch {
    // Clipboard may be unavailable outside secure context.
  }
}

export function StaffCredentialsModal({
  open,
  restaurantName,
  staffLogin,
  onClose,
}: StaffCredentialsModalProps) {
  if (!open || !staffLogin) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="tg-card tg-fade-in"
        style={{ width: '100%', maxWidth: 440, padding: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ margin: 0, fontSize: 17, fontWeight: 500, color: 'var(--tg-text)' }}>
          Restaurant created
        </p>
        <p style={{ margin: '8px 0 18px', fontSize: 13.5, color: 'var(--tg-text-muted)', lineHeight: 1.5 }}>
          Share these staff login details with <strong>{restaurantName}</strong>. They can sign in at{' '}
          <strong>/login</strong> to manage their kitchen.
        </p>

        <div
          style={{
            background: 'var(--tg-surface-muted)',
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: 11.5, color: 'var(--tg-text-faint)' }}>Email</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <code style={{ fontSize: 13.5, color: 'var(--tg-text)', wordBreak: 'break-all' }}>
                {staffLogin.email}
              </code>
              <button
                type="button"
                className="tg-btn tg-btn-ghost tg-btn-sm"
                onClick={() => void copyText(staffLogin.email, 'Email')}
              >
                <Copy size={13} />
              </button>
            </div>
          </div>

          <div>
            <p style={{ margin: 0, fontSize: 11.5, color: 'var(--tg-text-faint)' }}>Password</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <code style={{ fontSize: 13.5, color: 'var(--tg-text)' }}>{staffLogin.password}</code>
              <button
                type="button"
                className="tg-btn tg-btn-ghost tg-btn-sm"
                onClick={() => void copyText(staffLogin.password, 'Password')}
              >
                <Copy size={13} />
              </button>
            </div>
          </div>

          <div>
            <p style={{ margin: 0, fontSize: 11.5, color: 'var(--tg-text-faint)' }}>Role</p>
            <p style={{ margin: '2px 0 0', fontSize: 13.5, color: 'var(--tg-text)', textTransform: 'capitalize' }}>
              {staffLogin.role}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" className="tg-btn tg-btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
