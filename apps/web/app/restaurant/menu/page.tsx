'use client';

import { useState, type SyntheticEvent } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { AppShell } from '@/components/layout';
import {
  useCreateMenuItem,
  useDeleteMenuItem,
  useMenuItems,
  useMyRestaurant,
  useUpdateMenuItem,
} from '@/lib/hooks/food-delivery';
import { useFormErrors } from '@/lib/hooks/use-form-errors';
import { useToastQueryError } from '@/lib/hooks/use-toast-query-error';
import { formatInr } from '@/lib/pricing';
import type { MenuItem } from '@/lib/types/food-delivery';
import { parseMenuItem } from '@/lib/validation/food-delivery';
import { toastApiError, toastError, toastSuccess } from '@/lib/toast';

export default function RestaurantMenuPage() {
  const myRestaurant = useMyRestaurant();
  const restaurant = myRestaurant.data ?? undefined;
  const restaurantId = restaurant?.id ?? '';

  const { data: items, isLoading, isError, error } = useMenuItems(restaurantId, true);
  const createItem = useCreateMenuItem(restaurantId);
  const updateItem = useUpdateMenuItem(restaurantId);
  const deleteItem = useDeleteMenuItem(restaurantId);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const { errors, applyParse, clearErrors } = useFormErrors();

  useToastQueryError(myRestaurant.isError, myRestaurant.error);
  useToastQueryError(isError, error);

  function currentInput() {
    return { name, description: description || undefined, price };
  }

  function syncValidation(
    next: { name: string; description?: string; price: string | number },
    forceShow = false,
  ) {
    return applyParse(parseMenuItem(next), forceShow);
  }

  function resetForm() {
    setName('');
    setDescription('');
    setPrice('');
    clearErrors();
  }

  function startCreate() {
    setEditingId(null);
    resetForm();
    setShowForm((v) => !v);
  }

  function startEdit(item: MenuItem) {
    setShowForm(false);
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description ?? '');
    setPrice(String(item.price));
    clearErrors();
  }

  function cancelEdit() {
    setEditingId(null);
    resetForm();
  }

  async function handleCreate(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!restaurantId) {
      toastError('No restaurant found for your account');
      return;
    }

    const input = currentInput();
    const parsed = parseMenuItem(input);
    if (!applyParse(parsed, true) || !parsed.success) return;

    try {
      await createItem.mutateAsync(parsed.data);
      resetForm();
      setShowForm(false);
      toastSuccess('Menu item added');
    } catch (err) {
      toastApiError(err);
    }
  }

  async function handleUpdate(e: SyntheticEvent<HTMLFormElement>, itemId: string) {
    e.preventDefault();

    const input = currentInput();
    const parsed = parseMenuItem(input);
    if (!applyParse(parsed, true) || !parsed.success) return;

    try {
      await updateItem.mutateAsync({ id: itemId, input: parsed.data });
      cancelEdit();
      toastSuccess('Menu item updated');
    } catch (err) {
      toastApiError(err);
    }
  }

  function renderItemFields(idPrefix: string) {
    return (
      <>
        <label className="tg-label" htmlFor={`${idPrefix}-name`}>
          Name
        </label>
        <input
          id={`${idPrefix}-name`}
          className={`tg-input${errors.name ? ' tg-input-invalid' : ''}`}
          value={name}
          onChange={(e) => {
            const next = e.target.value;
            setName(next);
            syncValidation({ ...currentInput(), name: next });
          }}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? (
          <p className="tg-field-error" style={{ marginBottom: 8 }}>
            {errors.name}
          </p>
        ) : (
          <div style={{ marginBottom: 10 }} />
        )}

        <label className="tg-label" htmlFor={`${idPrefix}-description`}>
          Description
        </label>
        <textarea
          id={`${idPrefix}-description`}
          className={`tg-textarea${errors.description ? ' tg-input-invalid' : ''}`}
          value={description}
          onChange={(e) => {
            const next = e.target.value;
            setDescription(next);
            syncValidation({ ...currentInput(), description: next || undefined });
          }}
          aria-invalid={Boolean(errors.description)}
        />
        {errors.description ? (
          <p className="tg-field-error" style={{ marginBottom: 8 }}>
            {errors.description}
          </p>
        ) : (
          <div style={{ marginBottom: 10 }} />
        )}

        <label className="tg-label" htmlFor={`${idPrefix}-price`}>
          Price (INR)
        </label>
        <input
          id={`${idPrefix}-price`}
          className={`tg-input${errors.price ? ' tg-input-invalid' : ''}`}
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => {
            const next = e.target.value;
            setPrice(next);
            syncValidation({ ...currentInput(), price: next });
          }}
          aria-invalid={Boolean(errors.price)}
        />
        {errors.price ? (
          <p className="tg-field-error" style={{ marginBottom: 10 }}>
            {errors.price}
          </p>
        ) : (
          <div style={{ marginBottom: 12 }} />
        )}
      </>
    );
  }

  return (
    <AppShell>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 19, fontWeight: 500, margin: 0, color: 'var(--tg-text)' }}>
            Menu editor
          </h1>
          <p style={{ fontSize: 13, color: 'var(--tg-text-muted)', margin: '4px 0 0' }}>
            {restaurant?.name ?? (myRestaurant.isLoading ? '' : 'No restaurant linked')}
          </p>
        </div>
        <button
          type="button"
          className="tg-btn tg-btn-primary"
          disabled={!restaurantId || Boolean(editingId)}
          onClick={startCreate}
        >
          <Plus size={15} /> Add item
        </button>
      </div>

      {showForm ? (
        <form
          className="tg-card"
          style={{ padding: 18, marginBottom: 16 }}
          onSubmit={(e) => void handleCreate(e)}
          noValidate
        >
          {renderItemFields('create')}
          <button type="submit" className="tg-btn tg-btn-primary" disabled={createItem.isPending}>
            {createItem.isPending ? 'Saving…' : 'Save item'}
          </button>
        </form>
      ) : null}

      {!myRestaurant.isLoading && !restaurantId ? (
        <p style={{ color: 'var(--tg-danger-fg)' }}>
          No restaurant is linked to your staff account. Ask an admin to assign you as owner.
        </p>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items?.map((m) =>
          editingId === m.id ? (
            <form
              key={m.id}
              className="tg-card"
              style={{ padding: 18 }}
              onSubmit={(e) => void handleUpdate(e, m.id)}
              noValidate
            >
              {renderItemFields(`edit-${m.id}`)}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="submit"
                  className="tg-btn tg-btn-primary"
                  disabled={updateItem.isPending}
                >
                  {updateItem.isPending ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  type="button"
                  className="tg-btn tg-btn-secondary"
                  disabled={updateItem.isPending}
                  onClick={cancelEdit}
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div
              key={m.id}
              className="tg-card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                opacity: m.deletedAt ? 0.6 : 1,
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: 14, color: 'var(--tg-text)' }}>
                  {m.name}
                  {m.deletedAt ? (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        color: 'var(--tg-danger-fg)',
                        background: 'var(--tg-danger-bg)',
                        padding: '2px 8px',
                        borderRadius: 999,
                      }}
                    >
                      Deleted
                    </span>
                  ) : null}
                </p>
                <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--tg-text-muted)' }}>
                  {formatInr(m.price)}
                  {m.description ? ` · ${m.description}` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {!m.deletedAt ? (
                  <button
                    type="button"
                    className="tg-btn tg-btn-secondary tg-btn-sm"
                    disabled={deleteItem.isPending || Boolean(editingId)}
                    onClick={() => startEdit(m)}
                  >
                    <Pencil size={13} /> Edit
                  </button>
                ) : null}
                {!m.deletedAt ? (
                  <button
                    type="button"
                    className="tg-btn tg-btn-secondary tg-btn-sm"
                    style={{ color: 'var(--tg-danger-fg)' }}
                    disabled={deleteItem.isPending || Boolean(editingId)}
                    onClick={async () => {
                      try {
                        await deleteItem.mutateAsync(m.id);
                        toastSuccess('Menu item removed');
                      } catch (err) {
                        toastApiError(err);
                      }
                    }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                ) : null}
              </div>
            </div>
          ),
        )}
        {!myRestaurant.isLoading &&
        !isLoading &&
        restaurantId &&
        (items?.length ?? 0) === 0 ? (
          <p
            style={{
              fontSize: 13,
              color: 'var(--tg-text-faint)',
              padding: '24px 0',
              textAlign: 'center',
            }}
          >
            No menu items yet. Add your first dish.
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
