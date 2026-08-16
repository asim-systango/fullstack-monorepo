import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function PlusIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M12 6v12M6 12h12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CloseIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="m7 7 10 10M17 7 7 17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ImageIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect
        x="3.75"
        y="5.75"
        width="16.5"
        height="12.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="9" cy="10" r="1.4" fill="currentColor" />
      <path
        d="m5 16.5 4.2-4 3.1 3 2.6-2.3 4.1 3.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function VideoIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect
        x="3.75"
        y="6.75"
        width="11"
        height="10.5"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="m15.5 12 4.75-2.9v5.8L15.5 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CodeIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="m9 8-4 4 4 4M15 8l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeadingIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M6 5.5v13M18 5.5v13M6 12h12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TextIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M5 6.5h14M12 6.5v11"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TrashIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M5.5 7h13M10 7V5.5h4V7M7 7l.8 12h8.4L17 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BoldIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M7 5h6.2a3.8 3.8 0 0 1 0 7.6H7V5Zm0 7.6h7.1A3.9 3.9 0 0 1 14.1 20H7v-7.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ItalicIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M10 5h8M6 19h8M14.5 5 9.5 19"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StrikeIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M7 7.5c.6-1.7 2.5-2.8 5-2.8 2.8 0 4.6 1.3 4.6 3.3 0 1.2-.6 2.1-1.8 2.7M5 12h14M8.4 14.2c.2 2.3 2.1 3.6 4.6 3.6 2.7 0 4.6-1.3 4.6-3.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BulletListIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M9 7h11M9 12h11M9 17h11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="5" cy="7" r="1.15" fill="currentColor" />
      <circle cx="5" cy="12" r="1.15" fill="currentColor" />
      <circle cx="5" cy="17" r="1.15" fill="currentColor" />
    </svg>
  );
}

export function OrderedListIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M9 7h11M9 12h11M9 17h11M4.5 5.5V9h2M4.2 12.2h2.6l-2.6 3.3h2.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function QuoteIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M6 16.5c1.8 0 3-1.3 3-3.1 0-1.6-1-2.7-2.5-2.9.3-1.5 1.5-2.6 3.3-3.1M15 16.5c1.8 0 3-1.3 3-3.1 0-1.6-1-2.7-2.5-2.9.3-1.5 1.5-2.6 3.3-3.1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LinkIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M10 13.5 8.8 14.7a3.2 3.2 0 0 1-4.5-4.5L7 7.5a3.2 3.2 0 0 1 4.5 0M14 10.5l1.2-1.2a3.2 3.2 0 0 1 4.5 4.5L17 16.5a3.2 3.2 0 0 1-4.5 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="m10 14 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function UndoIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M8 8 5 11l3 3M5.5 11H14a5 5 0 0 1 5 5v.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RedoIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="m16 8 3 3-3 3M18.5 11H10a5 5 0 0 0-5 5v.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
