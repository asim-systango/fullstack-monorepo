import {
  draftToUpdateInput,
  emptyListFilters,
  resumeToDraft,
  type Resume,
} from './resume-types';

function makeResume(overrides: Partial<Resume> = {}): Resume {
  return {
    id: 'r1',
    ownerId: 'u1',
    title: 'Portfolio',
    templateId: 't1',
    template: {
      id: 't1',
      name: 'Classic',
      key: 'classic',
      isActive: true,
    },
    fullName: 'Asha Sharma',
    email: 'asha@example.com',
    phone: '123',
    location: 'Bengaluru',
    summary: 'Engineer',
    status: 'draft',
    slug: null,
    sections: [
      {
        id: 's2',
        type: 'education',
        title: 'Education',
        position: 1,
        items: [
          {
            id: 'i2',
            heading: 'B.E.',
            subheading: 'Uni',
            startDate: '2014',
            endDate: '2018',
            description: '',
            position: 0,
          },
        ],
      },
      {
        id: 's1',
        type: 'experience',
        title: 'Experience',
        position: 0,
        items: [
          {
            id: 'i1b',
            heading: 'Junior',
            subheading: 'Lab',
            startDate: '2018',
            endDate: '2021',
            description: '',
            position: 1,
          },
          {
            id: 'i1a',
            heading: 'Senior',
            subheading: 'Co',
            startDate: '2021',
            endDate: 'Present',
            description: 'Led work',
            position: 0,
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe('resumeToDraft', () => {
  it('copies fields and sorts sections/items by position', () => {
    const draft = resumeToDraft(makeResume());

    expect(draft.templateKey).toBe('classic');
    expect(draft.sections.map((s) => s.id)).toEqual(['s1', 's2']);
    expect(draft.sections[0]!.items.map((i) => i.id)).toEqual(['i1a', 'i1b']);
  });

  it('defaults template key when template relation is missing', () => {
    const draft = resumeToDraft(makeResume({ template: undefined }));
    expect(draft.templateKey).toBe('classic');
    expect(draft.templateName).toBe('');
  });
});

describe('draftToUpdateInput', () => {
  it('maps the draft into a PUT payload without nested template', () => {
    const input = draftToUpdateInput(resumeToDraft(makeResume()));

    expect(input).toEqual(
      expect.objectContaining({
        title: 'Portfolio',
        templateId: 't1',
        fullName: 'Asha Sharma',
        email: 'asha@example.com',
      }),
    );
    expect(input.sections).toHaveLength(2);
    expect(input.sections?.[0]).toEqual(
      expect.objectContaining({
        type: 'experience',
        title: 'Experience',
        position: 0,
        items: expect.arrayContaining([
          expect.objectContaining({ heading: 'Senior', position: 0 }),
        ]),
      }),
    );
  });
});

describe('emptyListFilters', () => {
  it('returns blank filter defaults', () => {
    expect(emptyListFilters()).toEqual({
      status: '',
      templateId: '',
      q: '',
    });
  });
});
