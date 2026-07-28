import { cn } from './cn';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('resolves conflicting Tailwind utilities', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('skips falsy values', () => {
    expect(cn('base', false && 'x', undefined, 'end')).toBe('base end');
  });
});
