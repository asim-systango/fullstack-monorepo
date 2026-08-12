'use client';

import { useState, type SyntheticEvent } from 'react';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { useCreateRestaurant, useRestaurants } from '@/lib/hooks/food-delivery';
import { useFormErrors } from '@/lib/hooks/use-form-errors';
import { useToastQueryError } from '@/lib/hooks/use-toast-query-error';
import { parseRestaurant } from '@/lib/validation/food-delivery';
import { toastApiError, toastSuccess } from '@/lib/toast';

// Leave empty so new restaurants are not accidentally attached to Hasty Tasty staff.
// Paste a real staff user UUID (e.g. 00000000-0000-4000-8000-000000000002 for hasty@tastygo.com).
const DEFAULT_OWNER_USER_ID = '';

export default function AdminRestaurantsPage() {
  const { data, isError, error } = useRestaurants();
  const createRestaurant = useCreateRestaurant();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [ownerUserId, setOwnerUserId] = useState(DEFAULT_OWNER_USER_ID);
  const { errors, applyParse, clearErrors } = useFormErrors();

  useToastQueryError(isError, error);

  function currentInput() {
    return {
      name,
      cuisine,
      address,
      description: description || undefined,
      ownerUserId,
    };
  }

  function syncValidation(
    next: {
      name: string;
      cuisine: string;
      address: string;
      description?: string;
      ownerUserId: string;
    },
    forceShow = false,
  ) {
    return applyParse(parseRestaurant(next), forceShow);
  }

  async function handleCreate(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = currentInput();
    const parsed = parseRestaurant(input);
    if (!applyParse(parsed, true) || !parsed.success) return;

    try {
      await createRestaurant.mutateAsync(parsed.data);
      setShowForm(false);
      setName('');
      setCuisine('');
      setAddress('');
      setDescription('');
      setOwnerUserId(DEFAULT_OWNER_USER_ID);
      clearErrors();
      toastSuccess('Restaurant created');
    } catch (err) {
      toastApiError(err);
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
        <h1 style={{ fontSize: 19, fontWeight: 500, margin: 0, color: 'var(--tg-text)' }}>
          Restaurants
        </h1>
        <button
          type="button"
          className="tg-btn tg-btn-primary"
          onClick={() => {
            setShowForm((v) => !v);
            clearErrors();
          }}
        >
          <Plus size={15} /> Add restaurant
        </button>
      </div>

      {showForm ? (
        <form
          className="tg-card"
          style={{ padding: 18, marginBottom: 16 }}
          onSubmit={(e) => void handleCreate(e)}
          noValidate
        >
          <label className="tg-label">Name</label>
          <input
            className={`tg-input${errors.name ? ' tg-input-invalid' : ''}`}
            value={name}
            onChange={(e) => {
              const next = e.target.value;
              setName(next);
              syncValidation({ ...currentInput(), name: next });
            }}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name ? <p className="tg-field-error" style={{ marginBottom: 8 }}>{errors.name}</p> : <div style={{ marginBottom: 10 }} />}

          <label className="tg-label">Cuisine</label>
          <input
            className={`tg-input${errors.cuisine ? ' tg-input-invalid' : ''}`}
            value={cuisine}
            onChange={(e) => {
              const next = e.target.value;
              setCuisine(next);
              syncValidation({ ...currentInput(), cuisine: next });
            }}
            aria-invalid={Boolean(errors.cuisine)}
          />
          {errors.cuisine ? <p className="tg-field-error" style={{ marginBottom: 8 }}>{errors.cuisine}</p> : <div style={{ marginBottom: 10 }} />}

          <label className="tg-label">Address</label>
          <textarea
            className={`tg-textarea${errors.address ? ' tg-input-invalid' : ''}`}
            value={address}
            onChange={(e) => {
              const next = e.target.value;
              setAddress(next);
              syncValidation({ ...currentInput(), address: next });
            }}
            aria-invalid={Boolean(errors.address)}
          />
          {errors.address ? <p className="tg-field-error" style={{ marginBottom: 8 }}>{errors.address}</p> : <div style={{ marginBottom: 10 }} />}

          <label className="tg-label">Owner user id</label>
          <input
            className={`tg-input${errors.ownerUserId ? ' tg-input-invalid' : ''}`}
            value={ownerUserId}
            onChange={(e) => {
              const next = e.target.value;
              setOwnerUserId(next);
              syncValidation({ ...currentInput(), ownerUserId: next });
            }}
            placeholder="UUID of a staff user"
            aria-invalid={Boolean(errors.ownerUserId)}
          />
          {errors.ownerUserId ? (
            <p className="tg-field-error" style={{ marginBottom: 8 }}>{errors.ownerUserId}</p>
          ) : (
            <p style={{ fontSize: 11.5, color: 'var(--tg-text-faint)', margin: '4px 0 12px' }}>
              Use a staff user id from the database seed (example above is Hasty Tasty staff).
            </p>
          )}

          <button type="submit" className="tg-btn tg-btn-primary" disabled={createRestaurant.isPending}>
            {createRestaurant.isPending ? 'Creating…' : 'Create restaurant'}
          </button>
        </form>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data?.items.map((r) => (
          <div
            key={r.id}
            className="tg-card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 18px',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: 'var(--tg-brand-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                }}
              >
                {r.emoji ?? '🍽️'}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: 14, color: 'var(--tg-text)' }}>
                  {r.name}
                </p>
                <p style={{ margin: '3px 0 0', fontSize: 12.5, color: 'var(--tg-text-muted)' }}>
                  {r.cuisine} · {r.address}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
