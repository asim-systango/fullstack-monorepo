import { Button } from '@shared/ui/components';

export function CheckoutActions({
  disabled,
  pending,
  onConfirm,
}: Readonly<{
  disabled: boolean;
  pending: boolean;
  onConfirm: () => void;
}>) {
  return (
    <Button
      type="button"
      loading={pending}
      loadingText="Checking out…"
      disabled={disabled}
      onClick={onConfirm}
    >
      Confirm checkout
    </Button>
  );
}
