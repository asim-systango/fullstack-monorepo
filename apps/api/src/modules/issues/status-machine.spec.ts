import { BadRequestException } from '@nestjs/common';
import { assertTransition } from './status-machine';

describe('assertTransition', () => {
  it('allows todo → in_progress', () => {
    expect(() => assertTransition('todo', 'in_progress')).not.toThrow();
  });
  it('allows in_progress → done', () => {
    expect(() => assertTransition('in_progress', 'done')).not.toThrow();
  });
  it('allows done → in_progress (reopen)', () => {
    expect(() => assertTransition('done', 'in_progress')).not.toThrow();
  });
  it('rejects todo → done', () => {
    expect(() => assertTransition('todo', 'done')).toThrow(BadRequestException);
  });
  it('rejects done → todo', () => {
    expect(() => assertTransition('done', 'todo')).toThrow(BadRequestException);
  });
});
