import { cn } from '@shared/ui';
import {
  formatDateRange,
  sortedItems,
  sortedSections,
  type TemplateProps,
} from './types';

/** Serif-inspired classic layout: centered header, ruled sections. */
export function ClassicTemplate({ resume, className }: TemplateProps) {
  const sections = sortedSections(resume.sections);

  return (
    <article
      className={cn(
        'resume-classic bg-card text-foreground border border-border p-8 shadow-sm',
        className,
      )}
    >
      <header className="mb-6 border-b-2 border-foreground pb-4 text-center">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          {resume.fullName || 'Your name'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {[resume.email, resume.phone, resume.location].filter(Boolean).join(' · ') ||
            'Contact details'}
        </p>
      </header>

      {resume.summary ? (
        <section className="mb-6">
          <h2 className="mb-2 font-serif text-lg font-semibold uppercase tracking-wide">
            Summary
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{resume.summary}</p>
        </section>
      ) : null}

      {sections.map((section) => (
        <section key={section.id} className="mb-6">
          <h2 className="mb-3 border-b border-border pb-1 font-serif text-lg font-semibold uppercase tracking-wide">
            {section.title}
          </h2>
          <ul className="space-y-4">
            {sortedItems(section.items).map((item) => {
              const dates = formatDateRange(item.startDate, item.endDate);
              return (
                <li key={item.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-semibold">{item.heading || 'Untitled'}</h3>
                    {dates ? (
                      <span className="font-mono text-xs text-muted-foreground">
                        {dates}
                      </span>
                    ) : null}
                  </div>
                  {item.subheading ? (
                    <p className="text-sm italic text-muted-foreground">
                      {item.subheading}
                    </p>
                  ) : null}
                  {item.description ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
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
