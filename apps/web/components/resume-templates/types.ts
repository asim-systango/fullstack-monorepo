import type { ResumeDraft, Section, SectionItem } from '@/lib/resume-types';

/** Shared prop for all template components (draft or public resume mapped to draft shape). */
export type ResumeViewModel = Pick<
  ResumeDraft,
  | 'fullName'
  | 'email'
  | 'phone'
  | 'location'
  | 'summary'
  | 'title'
  | 'sections'
  | 'templateKey'
>;

export type TemplateProps = Readonly<{
  resume: ResumeViewModel;
  className?: string;
}>;

export function sortedSections(sections: Section[]): Section[] {
  return [...sections].sort((a, b) => a.position - b.position);
}

export function sortedItems(items: SectionItem[]): SectionItem[] {
  return [...items].sort((a, b) => a.position - b.position);
}

export function formatDateRange(start: string, end: string): string {
  const s = start.trim();
  const e = end.trim();
  if (!s && !e) return '';
  if (s && e) return `${s} – ${e}`;
  return s || e;
}
