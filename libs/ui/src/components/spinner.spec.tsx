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
});

describe('LoadingState', () => {
  it('renders the visible label', () => {
    render(<LoadingState label="Please wait" />);
    expect(screen.getAllByText('Please wait').length).toBeGreaterThan(0);
  });
});

describe('Skeleton', () => {
  it('renders a placeholder element', () => {
    const { container } = render(<Skeleton size="line" />);
    expect(container.querySelector('.ui-skeleton-line')).toBeTruthy();
  });
});
