'use client';

import { useState, type SyntheticEvent } from 'react';
import { Plus } from 'lucide-react';
import { ApiClientError } from '@shared/api-client';
import { AppShell } from '@/components/layout';
import { useCreateRestaurant, useRestaurants } from '@/lib/hooks/food-delivery';
import { DEMO_USER_IDS } from '@/lib/mock/data';
import { parseRestaurant } from '@/lib/validation/food-delivery';

export default function AdminRestaurantsPage() {
  const { data, isLoading } = useRestaurants();
  const createRestaurant = useCreateRestaurant();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [ownerUserId, setOwnerUserId] = useState<string>(DEMO_USER_IDS.staff);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreate(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    const parsed = parseRestaurant({
      name,
      cuisine,
      address,
      description: description || undefined,
      ownerUserId,
    });
    if (!parsed.success) {
      setErrors(parsed.errors);
      return;
    }
    setErrors({});
    try {
      await createRestaurant.mutateAsync(parsed.data);
      setShowForm(false);
      setName('');
      setCuisine('');
      setAddress('');
      setDescription('');
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : 'Could not create restaurant');
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
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus size={15} /> Add restaurant
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
          {errors.name ? <p style={{ color: 'var(--tg-danger-fg)', fontSize: 12 }}>{errors.name}</p> : null}
          <label className="tg-label">Cuisine</label>
          <input className="tg-input" value={cuisine} onChange={(e) => setCuisine(e.target.value)} style={{ marginBottom: 10 }} />
          <label className="tg-label">Address</label>
          <textarea className="tg-textarea" value={address} onChange={(e) => setAddress(e.target.value)} style={{ marginBottom: 10 }} />
          <label className="tg-label">Owner user id</label>
          <input className="tg-input" value={ownerUserId} onChange={(e) => setOwnerUserId(e.target.value)} style={{ marginBottom: 12 }} />
          {formError ? <p style={{ color: 'var(--tg-danger-fg)', fontSize: 12 }}>{formError}</p> : null}
          <button type="submit" className="tg-btn tg-btn-primary" disabled={createRestaurant.isPending}>
            Create restaurant
          </button>
        </form>
      ) : null}

      {isLoading ? <p style={{ color: 'var(--tg-text-muted)' }}>Loading…</p> : null}

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
                  {r.cuisine} · owner staff account linked
                </p>
              </div>
            </div>
            <button type="button" className="tg-btn tg-btn-secondary tg-btn-sm">
              Manage
            </button>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
