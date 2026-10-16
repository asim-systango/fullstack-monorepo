/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ConfirmDialog } from '@/components/dashboard/confirm-dialog';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
  };
});

describe('ConfirmDialog', () => {
  it('renders the confirm action when open', () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={jest.fn()}
        title="Email all overdue members?"
        description="Members emailed in the last 24 hours are skipped."
        confirmLabel="Send emails"
        onConfirm={jest.fn()}
      />,
    );
    expect(screen.getByText('Email all overdue members?')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Send emails' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
  });
});
