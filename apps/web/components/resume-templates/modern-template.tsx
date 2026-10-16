import { cn } from '@shared/ui';
import {
  formatDateRange,
  sortedItems,
  sortedSections,
  type TemplateProps,
} from './types';

/** Two-tone modern layout: accent sidebar + content column. */
export function ModernTemplate({ resume, className }: TemplateProps) {
  const sections = sortedSections(resume.sections);

  return (
    <article
      className={cn(
        'resume-modern grid overflow-hidden border border-border bg-card text-foreground shadow-sm md:grid-cols-[11rem_1fr]',
        className,
      )}
    >
      <aside className="bg-primary px-5 py-8 text-primary-foreground">
        <h1 className="text-2xl font-semibold leading-tight">
          {resume.fullName || 'Your name'}
        </h1>
        <dl className="mt-6 space-y-3 text-xs leading-relaxed opacity-90">
          {resume.email ? (
            <div>
              <dt className="font-mono uppercase tracking-wider opacity-70">Email</dt>
              <dd className="break-all">{resume.email}</dd>
            </div>
          ) : null}
          {resume.phone ? (
            <div>
              <dt className="font-mono uppercase tracking-wider opacity-70">Phone</dt>
              <dd>{resume.phone}</dd>
            </div>
          ) : null}
          {resume.location ? (
            <div>
              <dt className="font-mono uppercase tracking-wider opacity-70">Location</dt>
              <dd>{resume.location}</dd>
            </div>
          ) : null}
        </dl>
      </aside>

      <div className="space-y-6 px-6 py-8">
        {resume.summary ? (
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              About
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {resume.summary}
            </p>
          </section>
        ) : null}

        {sections.map((section) => (
          <section key={section.id}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {section.title}
            </h2>
            <ul className="space-y-4 border-l-2 border-border pl-4">
              {sortedItems(section.items).map((item) => {
                const dates = formatDateRange(item.startDate, item.endDate);
                return (
                  <li key={item.id}>
                    <h3 className="font-semibold">{item.heading || 'Untitled'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {[item.subheading, dates].filter(Boolean).join(' · ')}
                    </p>
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
      </div>
    </article>
  );
}
