import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TemplatesService } from '../templates/templates.service';
import { Resume } from './resume.entity';
import { ResumesService } from './resumes.service';
import { Section } from './section.entity';
import { SectionItem } from './section-item.entity';

const OWNER = '11111111-1111-1111-1111-111111111111';
const OTHER = '22222222-2222-2222-2222-222222222222';
const TEMPLATE_ID = '33333333-3333-3333-3333-333333333333';
const RESUME_ID = '44444444-4444-4444-4444-444444444444';

function makeTemplate(overrides: Partial<{ id: string; isActive: boolean }> = {}) {
  return {
    id: TEMPLATE_ID,
    name: 'Classic',
    key: 'classic',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeItem(overrides: Partial<SectionItem> = {}): SectionItem {
  return {
    id: 'item-1',
    sectionId: 'sec-1',
    heading: 'Engineer',
    subheading: 'Acme',
    startDate: '2020',
    endDate: 'Present',
    description: 'Built things',
    position: 0,
    ...overrides,
  } as SectionItem;
}

function makeSection(overrides: Partial<Section> = {}): Section {
  return {
    id: 'sec-1',
    resumeId: RESUME_ID,
    type: 'experience',
    title: 'Experience',
    position: 0,
    items: [makeItem()],
    ...overrides,
  } as Section;
}

function makeResume(overrides: Partial<Resume> = {}): Resume {
  return {
    id: RESUME_ID,
    ownerId: OWNER,
    title: 'My resume',
    templateId: TEMPLATE_ID,
    template: makeTemplate() as Resume['template'],
    fullName: 'Asha Sharma',
    email: 'asha@example.com',
    phone: '',
    location: '',
    summary: '',
    status: 'draft',
    slug: null,
    sections: [makeSection()],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  } as Resume;
}

describe('ResumesService', () => {
  const resumes = {
    create: jest.fn((row: Partial<Resume>) => row),
    save: jest.fn(async (row: Resume) => row),
    findOne: jest.fn(),
    softRemove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const templates = {
    findById: jest.fn(),
  };

  const dataSource = {
    transaction: jest.fn(),
    query: jest.fn(),
  };

  let service: ResumesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ResumesService(
      resumes as unknown as Repository<Resume>,
      templates as unknown as TemplatesService,
      dataSource as unknown as DataSource,
    );
  });

  describe('create', () => {
    it('creates a draft when the template is active', async () => {
      templates.findById.mockResolvedValue(makeTemplate());
      resumes.save.mockImplementation(async (row: Resume) => ({
        ...row,
        id: RESUME_ID,
      }));

      const result = await service.create(OWNER, {
        title: '  Backend resume  ',
        templateId: TEMPLATE_ID,
      });

      expect(resumes.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerId: OWNER,
          title: 'Backend resume',
          templateId: TEMPLATE_ID,
          status: 'draft',
          slug: null,
        }),
      );
      expect(result.id).toBe(RESUME_ID);
    });

    it('rejects inactive templates', async () => {
      templates.findById.mockResolvedValue(makeTemplate({ isActive: false }));

      await expect(
        service.create(OWNER, { title: 'X', templateId: TEMPLATE_ID }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('collectPublishGaps', () => {
    it('lists missing fullName, email, and experience/education items', () => {
      const gaps = service.collectPublishGaps(
        makeResume({
          fullName: '  ',
          email: '',
          sections: [makeSection({ type: 'skills', items: [makeItem()] })],
        }),
      );

      expect(gaps.map((g) => g.field)).toEqual(['fullName', 'email', 'sections']);
    });

    it('returns no gaps when invariant is satisfied', () => {
      expect(service.collectPublishGaps(makeResume())).toEqual([]);
    });
  });

  describe('publish', () => {
    it('publishes with a slug from the full name', async () => {
      const resume = makeResume();
      resumes.findOne
        .mockResolvedValueOnce(resume) // findOwned
        .mockResolvedValueOnce(null) // allocateSlug
        .mockResolvedValueOnce({
          ...resume,
          status: 'published',
          slug: 'asha-sharma',
        }); // findOwned after save
      resumes.save.mockImplementation(async (row: Resume) => row);

      const result = await service.publish(RESUME_ID, OWNER);

      expect(resumes.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'published',
          slug: 'asha-sharma',
        }),
      );
      expect(result.status).toBe('published');
      expect(result.slug).toBe('asha-sharma');
    });

    it('appends -2 when the base slug is taken', async () => {
      const resume = makeResume();
      resumes.findOne
        .mockResolvedValueOnce(resume)
        .mockResolvedValueOnce(makeResume({ id: 'other-id', slug: 'asha-sharma' }))
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          ...resume,
          status: 'published',
          slug: 'asha-sharma-2',
        });

      await service.publish(RESUME_ID, OWNER);

      expect(resumes.save).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'asha-sharma-2' }),
      );
    });

    it('throws BadRequestException when the invariant fails', async () => {
      resumes.findOne.mockResolvedValue(
        makeResume({ fullName: '', email: '', sections: [] }),
      );

      await expect(service.publish(RESUME_ID, OWNER)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(resumes.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for another owner', async () => {
      resumes.findOne.mockResolvedValue(null);

      await expect(service.publish(RESUME_ID, OTHER)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('unpublish', () => {
    it('clears slug and sets draft', async () => {
      const published = makeResume({
        status: 'published',
        slug: 'asha-sharma',
      });
      resumes.findOne
        .mockResolvedValueOnce(published)
        .mockResolvedValueOnce({ ...published, status: 'draft', slug: null });

      const result = await service.unpublish(RESUME_ID, OWNER);

      expect(resumes.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'draft', slug: null }),
      );
      expect(result.status).toBe('draft');
    });
  });

  describe('findPublishedBySlug', () => {
    it('returns a published resume', async () => {
      const published = makeResume({
        status: 'published',
        slug: 'asha-sharma',
      });
      resumes.findOne.mockResolvedValue(published);

      await expect(service.findPublishedBySlug('asha-sharma')).resolves.toEqual(
        published,
      );
    });

    it('404s when missing or not published', async () => {
      resumes.findOne.mockResolvedValue(null);

      await expect(service.findPublishedBySlug('missing')).rejects.toThrow(
        'This resume is not available',
      );
    });
  });

  describe('softDelete', () => {
    it('soft-removes an owned resume', async () => {
      const resume = makeResume();
      resumes.findOne.mockResolvedValue(resume);

      await expect(service.softDelete(RESUME_ID, OWNER)).resolves.toEqual({
        ok: true,
      });
      expect(resumes.softRemove).toHaveBeenCalledWith(resume);
    });

    it('404s when not found', async () => {
      resumes.findOne.mockResolvedValue(null);

      await expect(service.softDelete(RESUME_ID, OWNER)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('duplicate', () => {
    it('copies resume, sections, and items inside a transaction as a draft', async () => {
      const source = makeResume({ title: 'Portfolio' });
      resumes.findOne.mockResolvedValue(source);

      const resumeRepo = {
        create: jest.fn((row: Partial<Resume>) => row),
        save: jest.fn(async (row: Partial<Resume>) => ({
          id: 'copy-id',
          ...row,
        })),
        findOne: jest.fn(async () =>
          makeResume({
            id: 'copy-id',
            title: 'Portfolio (copy)',
            status: 'draft',
            slug: null,
          }),
        ),
      };
      const sectionRepo = {
        create: jest.fn((row: Partial<Section>) => row),
        save: jest.fn(async (row: Partial<Section>) => ({
          id: 'new-sec',
          ...row,
        })),
      };
      const itemRepo = {
        create: jest.fn((row: Partial<SectionItem>) => row),
        save: jest.fn(async (row: Partial<SectionItem>) => row),
      };

      dataSource.transaction.mockImplementation(async (cb: (m: unknown) => unknown) =>
        cb({
          getRepository: (entity: unknown) => {
            if (entity === Resume) return resumeRepo;
            if (entity === Section) return sectionRepo;
            if (entity === SectionItem) return itemRepo;
            throw new Error('unexpected entity');
          },
        }),
      );

      const result = await service.duplicate(RESUME_ID, OWNER);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(resumeRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Portfolio (copy)',
          status: 'draft',
          slug: null,
          ownerId: OWNER,
        }),
      );
      expect(sectionRepo.save).toHaveBeenCalled();
      expect(itemRepo.save).toHaveBeenCalled();
      expect(result.title).toBe('Portfolio (copy)');
      expect(result.status).toBe('draft');
    });
  });

  describe('listOwn', () => {
    it('applies owner, filters, and pagination', async () => {
      const andWhere = jest.fn().mockReturnThis();
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        andWhere,
        getManyAndCount: jest.fn().mockResolvedValue([[makeResume()], 1]),
      };
      resumes.createQueryBuilder.mockReturnValue(qb);

      const result = await service.listOwn(OWNER, {
        status: 'draft',
        templateId: TEMPLATE_ID,
        q: ' port ',
        page: 2,
        limit: 10,
      });

      expect(qb.skip).toHaveBeenCalledWith(10);
      expect(qb.take).toHaveBeenCalledWith(10);
      expect(andWhere).toHaveBeenCalledWith('resume.ownerId = :ownerId', {
        ownerId: OWNER,
      });
      expect(andWhere).toHaveBeenCalledWith('resume.status = :status', {
        status: 'draft',
      });
      expect(andWhere).toHaveBeenCalledWith('resume.title ILIKE :q', {
        q: '%port%',
      });
      expect(result).toEqual({
        items: [expect.objectContaining({ id: RESUME_ID })],
        total: 1,
        page: 2,
        limit: 10,
      });
    });
  });
});
