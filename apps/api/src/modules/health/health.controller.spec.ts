import { HealthController } from './health.controller';
import { ReadyController } from './ready.controller';

describe('HealthController (api)', () => {
  it('returns ok', () => {
    expect(new HealthController().check()).toEqual({ status: 'ok' });
  });
});

describe('ReadyController (api)', () => {
  it('returns ok with service name for proxy checks', () => {
    expect(new ReadyController().check()).toEqual({
      status: 'ok',
      service: 'api',
    });
  });
});
