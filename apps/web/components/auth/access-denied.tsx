import Link from 'next/link';

type AccessDeniedProps = {
  title?: string;
  message: string;
  backHref: string;
  backLabel: string;
};

export function AccessDenied({
  title = 'Access Denied',
  message,
  backHref,
  backLabel,
}: Readonly<AccessDeniedProps>) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
        403
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-foreground">{title}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
      <Link
        href={backHref}
        className="mt-8 inline-flex h-10 items-center justify-center rounded-pill bg-button-primary px-5 text-sm font-medium text-button-primary-foreground no-underline hover:bg-foreground"
      >
        {backLabel}
      </Link>
    </div>
  );
}
