/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { CheckoutActions } from './checkout-actions';

describe('CheckoutActions', () => {
  it('disables confirm while pending or invalid', () => {
    const { rerender } = render(
      <CheckoutActions disabled pending={false} onConfirm={jest.fn()} />,
    );
    expect(
      (screen.getByRole('button', { name: 'Confirm checkout' }) as HTMLButtonElement).disabled,
    ).toBe(true);

    rerender(<CheckoutActions disabled={false} pending onConfirm={jest.fn()} />);
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true);
  });
});
