import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateRevisionDto } from './revision.dto';

const TAG_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';

describe('CreateRevisionDto', () => {
  it('accepts optional title, slug, and tagIds with a body', async () => {
    const dto = plainToInstance(CreateRevisionDto, {
      body: 'Updated draft',
      title: '  Hello  ',
      slug: 'Hello-World',
      tagIds: [TAG_ID],
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.title).toBe('Hello');
    expect(dto.slug).toBe('hello-world');
    expect(dto.tagIds).toEqual([TAG_ID]);
  });

  it('rejects an invalid slug', async () => {
    const dto = plainToInstance(CreateRevisionDto, {
      body: 'Updated draft',
      slug: 'NOT VALID',
    });
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain('slug');
  });

  it('rejects a non-uuid tag id', async () => {
    const dto = plainToInstance(CreateRevisionDto, {
      body: 'Updated draft',
      tagIds: ['not-a-uuid'],
    });
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain('tagIds');
  });
});
