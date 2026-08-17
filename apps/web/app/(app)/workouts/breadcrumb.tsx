import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export type BreadcrumbItem = Readonly<{ label: string; href?: string }>;

export type BreadcrumbProps = Readonly<{ items: BreadcrumbItem[] }>;

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 flex flex-wrap items-center gap-1.5 text-sm"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-1.5">
            {index > 0 ? (
              <ChevronRight className="size-3.5 text-border" aria-hidden="true" />
            ) : null}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-muted-foreground no-underline hover:text-primary hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast ? 'font-medium text-foreground' : 'text-muted-foreground'
                }
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
