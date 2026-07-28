import { HealthController } from './health.controller';

describe('HealthController (gateway)', () => {
  it('returns ok', () => {
    expect(new HealthController().check()).toEqual({ status: 'ok' });
  });
});
