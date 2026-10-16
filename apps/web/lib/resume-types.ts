export type ResumeStatus = 'draft' | 'published';

export type SectionType = 'experience' | 'education' | 'skills' | 'projects' | 'custom';

export type TemplateKey = 'classic' | 'modern' | 'compact' | (string & {});

export type Template = {
  id: string;
  name: string;
  key: TemplateKey;
  isActive: boolean;
};

export type SectionItem = {
  id: string;
  heading: string;
  subheading: string;
  startDate: string;
  endDate: string;
  description: string;
  position: number;
};

export type Section = {
  id: string;
  type: SectionType;
  title: string;
  position: number;
  items: SectionItem[];
};

export type Resume = {
  id: string;
  ownerId: string;
  ownerName?: string | null;
  title: string;
  templateId: string;
  template?: Template;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  status: ResumeStatus;
  slug: string | null;
  sections?: Section[];
  createdAt?: string;
  updatedAt?: string;
};

export type ResumeListResponse = {
  items: Resume[];
  total: number;
  page: number;
  limit: number;
};

export type ResumeListQuery = {
  status?: ResumeStatus;
  templateId?: string;
  q?: string;
  page?: number;
  limit?: number;
};

export type CreateResumeInput = {
  title: string;
  templateId: string;
};

export type UpdateResumeInput = {
  title?: string;
  templateId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  sections?: Array<{
    id?: string;
    type: SectionType;
    title: string;
    position: number;
    items?: Array<{
      id?: string;
      heading?: string;
      subheading?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
      position?: number;
    }>;
  }>;
};

/** Editor draft — Redux only; never Nest entity arrays in the store lists. */
export type ResumeDraft = {
  id: string;
  title: string;
  templateId: string;
  templateKey: TemplateKey;
  templateName: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  status: ResumeStatus;
  slug: string | null;
  sections: Section[];
};

export type ListFilters = {
  status: '' | ResumeStatus;
  templateId: string;
  q: string;
};

export const emptyListFilters = (): ListFilters => ({
  status: '',
  templateId: '',
  q: '',
});

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  custom: 'Custom',
};

export function resumeToDraft(resume: Resume): ResumeDraft {
  const sections = [...(resume.sections ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((section) => ({
      ...section,
      items: [...(section.items ?? [])].sort((a, b) => a.position - b.position),
    }));

  return {
    id: resume.id,
    title: resume.title,
    templateId: resume.templateId,
    templateKey: resume.template?.key ?? 'classic',
    templateName: resume.template?.name ?? '',
    fullName: resume.fullName ?? '',
    email: resume.email ?? '',
    phone: resume.phone ?? '',
    location: resume.location ?? '',
    summary: resume.summary ?? '',
    status: resume.status,
    slug: resume.slug,
    sections,
  };
}

export function draftToUpdateInput(draft: ResumeDraft): UpdateResumeInput {
  return {
    title: draft.title,
    templateId: draft.templateId,
    fullName: draft.fullName,
    email: draft.email,
    phone: draft.phone,
    location: draft.location,
    summary: draft.summary,
    sections: draft.sections.map((section, index) => ({
      type: section.type,
      title: section.title,
      position: section.position ?? index,
      items: section.items.map((item, itemIndex) => ({
        heading: item.heading,
        subheading: item.subheading,
        startDate: item.startDate,
        endDate: item.endDate,
        description: item.description,
        position: item.position ?? itemIndex,
      })),
    })),
  };
}
