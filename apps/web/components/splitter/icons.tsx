import type { ReactNode, SVGProps } from 'react';

type IconProps = Readonly<SVGProps<SVGSVGElement>>;

function IconBase({ children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      width="1.15em"
      height="1.15em"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </IconBase>
  );
}

export function IconGroups(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </IconBase>
  );
}

export function IconExpenses(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M8 3h8a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2z" />
      <path d="M9 9h6" />
      <path d="M9 13h4" />
    </IconBase>
  );
}

export function IconBalances(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3v18" />
      <path d="M5 8h14" />
      <path d="M7 8l-3 6h6l-3-6z" />
      <path d="M17 8l-3 6h6l-3-6z" />
    </IconBase>
  );
}

export function IconSettlements(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 8h12l-3-3" />
      <path d="M17 16H5l3 3" />
    </IconBase>
  );
}

export function IconActivity(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </IconBase>
  );
}

export function IconFriends(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </IconBase>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </IconBase>
  );
}

export function IconHelp(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8" />
      <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function IconSun(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </IconBase>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 6l6 6-6 6" />
    </IconBase>
  );
}

export function IconAccount(props: IconProps) {
  return <IconFriends {...props} />;
}

export function IconMenu(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </IconBase>
  );
}

export function IconLogout(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </IconBase>
  );
}

export function IconWallet(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H19a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2H6a3 3 0 0 1-3-3z" />
      <path d="M3 8.5V7a2 2 0 0 1 2-2h12" />
      <circle cx="16.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function IconArrowDown(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14" />
      <path d="M6 13l6 6 6-6" />
    </IconBase>
  );
}

export function IconPerson(props: IconProps) {
  return <IconFriends {...props} />;
}

export function IconChevron(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 9l6 6 6-6" />
    </IconBase>
  );
}

export function IconGlobe(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </IconBase>
  );
}

export function IconMail(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16v10H4z" />
      <path d="m4 7 8 6 8-6" />
    </IconBase>
  );
}

export function IconLock(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
      <path d="M6 11h12v9H6z" />
    </IconBase>
  );
}

export function IconEye(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M2.5 12.5S6 6 12 6s9.5 6.5 9.5 6.5S18 19 12 19 2.5 12.5 2.5 12.5z" />
      <circle cx="12" cy="12.5" r="2.5" />
    </IconBase>
  );
}

export function IconEyeOff(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6A2.5 2.5 0 0 0 12 16.5a2.5 2.5 0 0 0 1.4-.4" />
      <path d="M6.7 6.7C4.5 8.1 3 10.5 3 10.5S6 17 12 17c1.2 0 2.3-.3 3.3-.8" />
      <path d="M14.1 9.9C14.6 10.4 15 11.1 15 12c0 1.7-1.3 3-3 3-.9 0-1.6-.4-2.1-.9" />
    </IconBase>
  );
}

export function IconGoogle(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width="1.15em" height="1.15em" aria-hidden {...props}>
      <path
        fill="#4285F4"
        d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.7a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.5z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 5-.9 6.6-2.4l-3.3-2.6c-.9.6-2.1 1-3.3 1-2.5 0-4.7-1.7-5.4-4H3.1v2.7C4.7 19.9 8.1 22 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.6 14c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.5H3.1A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.5l3.5-2.5z"
      />
      <path
        fill="#EA4335"
        d="M12 5.4c1.5 0 2.8.5 3.9 1.5l2.9-2.9C17 2.4 14.7 1.5 12 1.5 8.1 1.5 4.7 3.6 3.1 7.5l3.5 2.7C7.3 7.1 9.5 5.4 12 5.4z"
      />
    </svg>
  );
}

export function IconApple(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1.15em"
      height="1.15em"
      aria-hidden
      fill="currentColor"
      {...props}
    >
      <path d="M16.7 12.6c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.8 3-.8 1.4 0 1.8.8 3 .8 1.2 0 2-1.1 2.8-2.2.9-1.3 1.2-2.6 1.2-2.7-.1 0-2.4-.9-2.4-3.6zM14.6 4.8c.7-.8 1.1-2 1-3.1-1 .1-2.2.6-2.9 1.4-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.3z" />
    </svg>
  );
}
