import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Template } from './template.entity';
import { TemplatesService } from './templates.service';

describe('TemplatesService', () => {
  const templates = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  let service: TemplatesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TemplatesService(templates as unknown as Repository<Template>);
  });

  describe('findAll', () => {
    it('filters to active templates when requested', async () => {
      templates.find.mockResolvedValue([]);
      await service.findAll({ activeOnly: true });
      expect(templates.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { name: 'ASC' },
      });
    });

    it('returns all templates for admin listing', async () => {
      templates.find.mockResolvedValue([]);
      await service.findAll();
      expect(templates.find).toHaveBeenCalledWith({
        where: {},
        order: { name: 'ASC' },
      });
    });
  });

  describe('findById', () => {
    it('returns the template', async () => {
      const row = { id: 't1', name: 'Classic', key: 'classic', isActive: true };
      templates.findOne.mockResolvedValue(row);
      await expect(service.findById('t1')).resolves.toEqual(row);
    });

    it('throws when missing', async () => {
      templates.findOne.mockResolvedValue(null);
      await expect(service.findById('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('toggles isActive', async () => {
      const row = {
        id: 't1',
        name: 'Classic',
        key: 'classic',
        isActive: true,
      };
      templates.findOne.mockResolvedValue(row);
      templates.save.mockImplementation(async (t: Template) => t);

      const result = await service.update('t1', { isActive: false });

      expect(result.isActive).toBe(false);
      expect(templates.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });
  });
});
