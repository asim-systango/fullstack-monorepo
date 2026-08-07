'use client';

import { useState, type SyntheticEvent } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { ApiClientError } from '@shared/api-client';
import { AppShell } from '@/components/layout';
import {
  useCreateMenuItem,
  useDeleteMenuItem,
  useMenuItems,
} from '@/lib/hooks/food-delivery';
import { formatInr } from '@/lib/pricing';
import { parseMenuItem } from '@/lib/validation/food-delivery';
import { RESTAURANT_IDS } from '@/lib/mock/data';

const STAFF_RESTAURANT_ID = RESTAURANT_IDS.hasty;
const DANGER_COLOR = 'var(--tg-danger-fg)';

export default function RestaurantMenuPage() {
  const { data: items, isLoading } = useMenuItems(STAFF_RESTAURANT_ID, true);
  const createItem = useCreateMenuItem(STAFF_RESTAURANT_ID);
  const deleteItem = useDeleteMenuItem(STAFF_RESTAURANT_ID);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreate(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const parsed = parseMenuItem({ name, description: description || undefined, price });
    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    try {
      await createItem.mutateAsync(parsed.data);
      setName('');
      setDescription('');
      setPrice('');
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : 'Could not create item');
    }
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
            Hasty Tasty
          </p>
        </div>
        <button
          type="button"
          className="tg-btn tg-btn-primary"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus size={15} /> Add item
        </button>
      </div>

      {showForm ? (
        <form
          className="tg-card"
          style={{ padding: 18, marginBottom: 16 }}
          onSubmit={(e) => void handleCreate(e)}
        >
          <label className="tg-label">Name</label>
          <input className="tg-input" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 10 }} />
          {errors.name ? <p style={{ color: DANGER_COLOR, fontSize: 12 }}>{errors.name}</p> : null}
          <label className="tg-label">Description</label>
          <textarea className="tg-textarea" value={description} onChange={(e) => setDescription(e.target.value)} style={{ marginBottom: 10 }} />
          <label className="tg-label">Price (INR)</label>
          <input className="tg-input" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} style={{ marginBottom: 12 }} />
          {errors.price ? <p style={{ color: DANGER_COLOR, fontSize: 12 }}>{errors.price}</p> : null}
          {formError ? <p style={{ color: DANGER_COLOR, fontSize: 12 }}>{formError}</p> : null}
          <button type="submit" className="tg-btn tg-btn-primary" disabled={createItem.isPending}>
            Save item
          </button>
        </form>
      ) : null}

      {isLoading ? <p style={{ color: 'var(--tg-text-muted)' }}>Loading menu…</p> : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items?.map((m) => (
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
                      color: DANGER_COLOR,
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
              <button type="button" className="tg-btn tg-btn-secondary tg-btn-sm" disabled>
                <Pencil size={13} /> Edit
              </button>
              {!m.deletedAt ? (
                <button
                  type="button"
                  className="tg-btn tg-btn-secondary tg-btn-sm"
                  style={{ color: DANGER_COLOR }}
                  disabled={deleteItem.isPending}
                  onClick={() => void deleteItem.mutateAsync(m.id)}
                >
                  <Trash2 size={13} /> Delete
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
