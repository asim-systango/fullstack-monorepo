'use client';

import { useEffect, useState, type CSSProperties } from 'react';

const PIECES = Array.from({ length: 28 }, (_, i) => i);

/** Lightweight CSS confetti burst shown after successful registration. */
export function ConfettiBurst({ active }: Readonly<{ active: boolean }>) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }
    setShow(true);
    const t = window.setTimeout(() => setShow(false), 1600);
    return () => window.clearTimeout(t);
  }, [active]);

  if (!show) return null;

  return (
    <div className="tf-confetti" aria-hidden>
      <div className="tf-confetti-check">
        <svg viewBox="0 0 64 64" width="72" height="72" aria-hidden>
          <circle cx="32" cy="32" r="30" fill="var(--success, #1f9d6c)" opacity="0.95" />
          <path
            d="M18 33.5 27 42.5 46 23"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
      {PIECES.map((i) => (
        <span
          key={i}
          className="tf-confetti-piece"
          style={
            {
              '--i': i,
              '--x': `${(i % 7) * 14 - 42}%`,
              '--hue': `${(i * 37) % 360}`,
              '--delay': `${(i % 9) * 35}ms`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
