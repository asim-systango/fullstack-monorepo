import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GetAuctionQueryDto } from './get-auction-query.dto';

async function validateQuery(plain: Record<string, unknown>) {
  const dto = plainToInstance(GetAuctionQueryDto, plain);
  return validate(dto);
}

describe('GetAuctionQueryDto', () => {
  it('accepts integer page and limit', async () => {
    const errors = await validateQuery({ page: '2', limit: '10' });
    expect(errors).toHaveLength(0);
  });

  it('rejects decimal page', async () => {
    const errors = await validateQuery({ page: '1.5', limit: '20' });
    expect(errors.some((e) => e.property === 'page')).toBe(true);
  });

  it('rejects decimal limit', async () => {
    const errors = await validateQuery({ page: '1', limit: '2.5' });
    expect(errors.some((e) => e.property === 'limit')).toBe(true);
  });

  it('applies defaults when page and limit are omitted', async () => {
    const dto = plainToInstance(GetAuctionQueryDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(20);
  });
});
