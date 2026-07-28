/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { StatusMessage } from './status-message';
import { Button } from './button';

describe('StatusMessage', () => {
  it('exposes role=alert for error tone', () => {
    render(<StatusMessage tone="error">Something went wrong</StatusMessage>);
    expect(screen.getByRole('alert').textContent).toBe('Something went wrong');
  });

  it('does not use alert role for neutral tone', () => {
    render(<StatusMessage>All good</StatusMessage>);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('All good')).toBeTruthy();
  });
});

describe('Button', () => {
  it('disables and sets aria-busy while loading', () => {
    render(<Button loading>Save</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveProperty('disabled', true);
    expect(button.getAttribute('aria-busy')).toBe('true');
  });
});
