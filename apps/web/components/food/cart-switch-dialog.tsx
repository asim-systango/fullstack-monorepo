'use client';

import { useClearCart } from '@/lib/hooks/food-delivery';

type CartSwitchDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRestaurantName: string;
  onConfirm: () => void;
}>;

export function CartSwitchDialog({
  open,
  onOpenChange,
  currentRestaurantName,
  onConfirm,
}: CartSwitchDialogProps) {
  const clearCart = useClearCart();

  if (!open) return null;

  async function handleConfirm() {
    await clearCart.mutateAsync();
    onOpenChange(false);
    onConfirm();
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: 16,
      }}
      onClick={() => onOpenChange(false)}
    >
      <div
        className="tg-card tg-fade-in"
        style={{ width: '100%', maxWidth: 400, padding: 22 }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ margin: 0, fontSize: 17, fontWeight: 500, color: 'var(--tg-text)' }}>
          Switch restaurant?
        </p>
        <p style={{ margin: '8px 0 18px', fontSize: 13.5, color: 'var(--tg-text-muted)', lineHeight: 1.5 }}>
          Your cart has items from <strong>{currentRestaurantName}</strong>. Adding from a different
          restaurant will clear your current cart.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" className="tg-btn tg-btn-ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button
            type="button"
            className="tg-btn tg-btn-primary"
            disabled={clearCart.isPending}
            onClick={() => void handleConfirm()}
          >
            Clear cart & continue
          </button>
        </div>
      </div>
    </div>
  );
}
