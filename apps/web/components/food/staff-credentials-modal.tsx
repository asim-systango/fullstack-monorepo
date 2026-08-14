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
    <div className="tg-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="tg-card tg-modal-panel tg-fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-credentials-title"
        onClick={(e) => e.stopPropagation()}
      >
        <p
          id="staff-credentials-title"
          style={{ margin: 0, fontSize: 17, fontWeight: 500, color: 'var(--tg-text)' }}
        >
          Restaurant created
        </p>
        <p style={{ margin: '8px 0 18px', fontSize: 13.5, color: 'var(--tg-text-muted)', lineHeight: 1.5 }}>
          Share these staff login details with <strong>{restaurantName}</strong>. They can sign in at{' '}
          <strong>/login</strong> to manage their kitchen.
        </p>

        <div className="tg-credentials-box">
          <div>
            <p className="tg-credentials-label">Email</p>
            <div className="tg-credentials-row">
              <code className="tg-credentials-value">{staffLogin.email}</code>
              <button
                type="button"
                className="tg-copy-btn"
                aria-label="Copy email"
                onClick={() => void copyText(staffLogin.email, 'Email')}
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          <div>
            <p className="tg-credentials-label">Password</p>
            <div className="tg-credentials-row">
              <code className="tg-credentials-value">{staffLogin.password}</code>
              <button
                type="button"
                className="tg-copy-btn"
                aria-label="Copy password"
                onClick={() => void copyText(staffLogin.password, 'Password')}
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          <div>
            <p className="tg-credentials-label">Role</p>
            <p className="tg-credentials-role">{staffLogin.role}</p>
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
