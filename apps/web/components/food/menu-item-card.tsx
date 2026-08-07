'use client';

import { useState } from 'react';
import { ApiClientError } from '@shared/api-client';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Field,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import { formatInr } from '@/lib/pricing';
import type { MenuItem } from '@/lib/types/food-delivery';
import { useAddToCart } from '@/lib/hooks/food-delivery';
import { CartSwitchDialog } from './cart-switch-dialog';

type MenuItemCardProps = Readonly<{
  item: MenuItem;
  cartRestaurantId: string | null;
  cartRestaurantName: string | null;
}>;

export function MenuItemCard({ item, cartRestaurantId, cartRestaurantName }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [switchOpen, setSwitchOpen] = useState(false);
  const addToCart = useAddToCart();

  const needsSwitch = cartRestaurantId !== null && cartRestaurantId !== item.restaurantId;

  async function addItem() {
    setError(null);
    try {
      await addToCart.mutateAsync({ menuItemId: item.id, quantity });
      setQuantity(1);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not add to cart');
    }
  }

  async function handleAddClick() {
    if (needsSwitch) {
      setSwitchOpen(true);
      return;
    }
    await addItem();
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">{item.name}</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-col gap-3">
          {item.description ? (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          ) : null}
          <p className="font-medium">{formatInr(item.price)}</p>
          <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-end">
            <Field label="Qty" htmlFor={`qty-${item.id}`} className="sm:w-24">
              <TextInput
                id={`qty-${item.id}`}
                type="number"
                min={1}
                max={99}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
            </Field>
            <Button
              type="button"
              loading={addToCart.isPending}
              onClick={() => void handleAddClick()}
              className="sm:flex-1"
            >
              Add to cart
            </Button>
          </div>
          {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}
        </CardBody>
      </Card>

      <CartSwitchDialog
        open={switchOpen}
        onOpenChange={setSwitchOpen}
        currentRestaurantName={cartRestaurantName ?? 'another restaurant'}
        onConfirm={() => void addItem()}
      />
    </>
  );
}
