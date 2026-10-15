/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders standard button children and type', () => {
    render(<Button type="submit">Click Me</Button>);
    const button = screen.getByRole('button', { name: 'Click Me' });
    expect(button).toBeTruthy();
    expect(button.getAttribute('type')).toBe('submit');
  });

  it('handles disabled state', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button', { name: 'Disabled Button' });
    expect(button.getAttribute('disabled')).toBeDefined();
  });

  it('renders all variants and sizes', () => {
    const variants = [
      'primary',
      'secondary',
      'outline',
      'ghost',
      'danger',
      'success',
      'link',
    ] as const;
    const sizes = ['xs', 'sm', 'md', 'lg', 'icon'] as const;

    for (const variant of variants) {
      for (const size of sizes) {
        const { unmount } = render(
          <Button variant={variant} size={size}>
            {variant}-{size}
          </Button>,
        );
        expect(screen.getByRole('button')).toBeTruthy();
        unmount();
      }
    }
  });

  it('handles loading state with custom loadingText and children', () => {
    const { rerender } = render(
      <Button loading loadingText="Saving...">
        Save
      </Button>,
    );
    expect(screen.getByText('Saving...')).toBeTruthy();
    expect(screen.getByRole('button').getAttribute('aria-busy')).toBe('true');

    rerender(<Button loading>Submit</Button>);
    expect(screen.getByText('Submit')).toBeTruthy();
  });
});
