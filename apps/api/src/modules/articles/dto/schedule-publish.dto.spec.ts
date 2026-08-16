import { validate } from 'class-validator';
import { SchedulePublishDto } from './schedule-publish.dto';

const REVISION_ID = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';

describe('SchedulePublishDto', () => {
  it('accepts a revision UUID and an ISO timestamp', async () => {
    const dto = Object.assign(new SchedulePublishDto(), {
      revisionId: REVISION_ID,
      scheduledAt: '2026-08-20T10:00:00.000Z',
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('accepts an offset timestamp so 22:46 local is not treated as 22:46 UTC', async () => {
    const dto = Object.assign(new SchedulePublishDto(), {
      revisionId: REVISION_ID,
      scheduledAt: '2026-08-20T22:46:00+05:30',
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects a missing revisionId', async () => {
    const dto = Object.assign(new SchedulePublishDto(), {
      scheduledAt: '2026-08-20T10:00:00.000Z',
    });
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain('revisionId');
  });

  it('rejects a missing scheduledAt', async () => {
    const dto = Object.assign(new SchedulePublishDto(), {
      revisionId: REVISION_ID,
    });
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain('scheduledAt');
  });

  it('rejects a non-ISO scheduledAt', async () => {
    const dto = Object.assign(new SchedulePublishDto(), {
      revisionId: REVISION_ID,
      scheduledAt: 'tomorrow morning',
    });
    const errors = await validate(dto);
    expect(errors.map((error) => error.property)).toContain('scheduledAt');
  });
});
