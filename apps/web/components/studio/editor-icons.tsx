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
