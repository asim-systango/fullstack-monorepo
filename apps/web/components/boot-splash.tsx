'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth';
import { BrandSplash } from './brand-loader';

/**
 * Covers the app on hard refresh / first paint until auth settles,
 * then fades out. Works with the SSR `#tf-boot-splash` in layout.
 */
export function BootSplash() {
  const { loading } = useAuth();
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Remove static SSR splash as soon as React mounts (client takes over).
    const ssr = document.getElementById('tf-boot-splash');
    if (ssr) ssr.remove();
  }, []);

  useEffect(() => {
    if (loading) {
      setVisible(true);
      setExiting(false);
      return;
    }
    setExiting(true);
    const t = window.setTimeout(() => setVisible(false), 320);
    return () => window.clearTimeout(t);
  }, [loading]);

  if (!visible) return null;

  return (
    <div
      className={`tf-boot-overlay${exiting ? ' tf-boot-overlay-exit' : ''}`}
      aria-busy={loading}
    >
      <BrandSplash label="Loading TaskFlow…" />
    </div>
  );
}
