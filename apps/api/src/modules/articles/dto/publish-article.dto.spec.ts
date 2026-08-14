import { validate } from 'class-validator';
import { PublishArticleDto } from './publish-article.dto';

describe('PublishArticleDto', () => {
  it('accepts a revision UUID', async () => {
    const dto = Object.assign(new PublishArticleDto(), {
      revisionId: 'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects a missing revisionId with a validation error, not a resource miss', async () => {
    const dto = new PublishArticleDto();
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain('revisionId');
  });
});
