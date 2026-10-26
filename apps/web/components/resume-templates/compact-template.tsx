import { cn } from '@shared/ui';
import {
  formatDateRange,
  sortedItems,
  sortedSections,
  type TemplateProps,
} from './types';

/** Dense single-column compact layout for one-page resumes. */
export function CompactTemplate({ resume, className }: TemplateProps) {
  const sections = sortedSections(resume.sections);

  return (
    <article
      className={cn(
        'resume-compact border border-border bg-background px-5 py-4 text-foreground shadow-sm',
        className,
      )}
    >
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-dashed border-border pb-2">
        <div>
          <h1 className="text-xl font-semibold leading-tight">
            {resume.fullName || 'Your name'}
          </h1>
          {resume.title ? (
            <p className="font-mono text-xs text-muted-foreground">{resume.title}</p>
          ) : null}
        </div>
        <p className="max-w-xs text-right font-mono text-[11px] leading-snug text-muted-foreground">
          {[resume.email, resume.phone, resume.location].filter(Boolean).join('\n') ||
            'Contact details'}
        </p>
      </header>

      {resume.summary ? (
        <p className="mb-3 whitespace-pre-wrap text-xs leading-snug text-muted-foreground">
          {resume.summary}
        </p>
      ) : null}

      {sections.map((section) => (
        <section key={section.id} className="mb-3">
          <h2 className="mb-1 bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wider">
            {section.title}
          </h2>
          <ul className="space-y-1.5">
            {sortedItems(section.items).map((item) => {
              const dates = formatDateRange(item.startDate, item.endDate);
              return (
                <li key={item.id} className="text-xs leading-snug">
                  <span className="font-semibold">{item.heading || 'Untitled'}</span>
                  {item.subheading ? (
                    <span className="text-muted-foreground"> — {item.subheading}</span>
                  ) : null}
                  {dates ? (
                    <span className="float-right font-mono text-[10px] text-muted-foreground">
                      {dates}
                    </span>
                  ) : null}
                  {item.description ? (
                    <p className="mt-0.5 whitespace-pre-wrap text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </article>
  );
}
