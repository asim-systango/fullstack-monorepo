/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { LoadingState, Skeleton, Spinner } from './spinner';

describe('Spinner', () => {
  it('exposes an accessible label', () => {
    render(<Spinner label="Loading data" />);
    expect(screen.getByText('Loading data')).toBeTruthy();
    expect(screen.getByRole('status')).toBeTruthy();
  });

  it('supports sm, md, and lg sizes', () => {
    const { container: c1 } = render(<Spinner size="sm" />);
    expect(c1.querySelector('.ui-spinner-sm')).toBeTruthy();

    const { container: c2 } = render(<Spinner size="md" />);
    expect(c2.querySelector('.ui-spinner-md')).toBeTruthy();

    const { container: c3 } = render(<Spinner size="lg" />);
    expect(c3.querySelector('.ui-spinner-lg')).toBeTruthy();
  });
});

describe('LoadingState', () => {
  it('renders the visible label in inline and block variants', () => {
    const { rerender } = render(<LoadingState label="Please wait" variant="inline" />);
    expect(screen.getAllByText('Please wait').length).toBeGreaterThan(0);

    rerender(<LoadingState label="Please wait" variant="block" />);
    expect(screen.getAllByText('Please wait').length).toBeGreaterThan(0);
  });
});

describe('Skeleton', () => {
  it('renders placeholder elements for sm, md, lg, and line sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'line'] as const;
    for (const size of sizes) {
      const { container } = render(<Skeleton size={size} />);
      expect(container.querySelector(`.ui-skeleton-${size}`)).toBeTruthy();
    }
  });
});
