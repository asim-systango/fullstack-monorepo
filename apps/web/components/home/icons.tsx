import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function SearchIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="m16.2 16.2 4.3 4.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GridIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <rect x="4" y="4" width="6" height="6" rx="1.2" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" />
      <rect x="14" y="14" width="6" height="6" rx="1.2" />
    </svg>
  );
}

export function WriteIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M14.2 4.8 19.2 9.8M4 20l1.3-5.2L15.7 4.4a2.1 2.1 0 0 1 3 0l.9.9a2.1 2.1 0 0 1 0 3L9.2 18.7 4 20Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CompassIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m14.8 9.2-1.1 4.5-4.5 1.1 1.1-4.5 4.5-1.1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronRightIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="m9 6 6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UserIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="12" cy="9" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 19.2c1.4-2.6 3.7-4 6.5-4s5.1 1.4 6.5 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ClapIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M11.2 8.4 9.4 6.6a1.4 1.4 0 0 0-2 2l.5.5M13.4 6.8l-1-1a1.4 1.4 0 0 0-2 2l.4.4M15.8 8.2l-.8-.8a1.4 1.4 0 1 0-2 2l.3.3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M8.2 10.4 6.8 11.8a3.2 3.2 0 0 0 0 4.5l2.7 2.7a4.8 4.8 0 0 0 6.8 0l1.8-1.8a2.4 2.4 0 0 0 0-3.4l-2.4-2.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CommentIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M7.5 17.5 5 20v-4.2A7.5 7.5 0 1 1 12 19.5c-1.6 0-3.1-.4-4.5-1.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShareIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="18" cy="5.5" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="12" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="18.5" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m8.1 10.9 7.8-4.1M8.1 13.1l7.8 4.1"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function MinusCircleIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 12h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function BookmarkIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M7 4.75h10A1.25 1.25 0 0 1 18.25 6v13.1l-5.7-3.4a1 1 0 0 0-1.1 0l-5.7 3.4V6A1.25 1.25 0 0 1 7 4.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThumbsDownIcon(props: Readonly<IconProps>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M9.5 14.5V6.8A1.8 1.8 0 0 1 11.3 5h5.3a2 2 0 0 1 1.9 1.5l1.3 5.1a1.6 1.6 0 0 1-1.6 2H14.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 14.5H6.8A1.8 1.8 0 0 1 5 12.7V8.3A1.8 1.8 0 0 1 6.8 6.5H9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 14.5 11 19a1.8 1.8 0 0 0 1.8 1.5h.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
