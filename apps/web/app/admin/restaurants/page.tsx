'use client';

import { useState, type SyntheticEvent } from 'react';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/layout';
import { ImageUpload, StaffCredentialsModal } from '@/components/food';
import { useCreateRestaurant, useRestaurants, useUpdateRestaurant } from '@/lib/hooks/food-delivery';
import { useFormErrors } from '@/lib/hooks/use-form-errors';
import { useToastQueryError } from '@/lib/hooks/use-toast-query-error';
import type { StaffLoginDetails } from '@/lib/types/food-delivery';
import { parseRestaurant } from '@/lib/validation/food-delivery';
import { toastApiError, toastError, toastSuccess } from '@/lib/toast';

export default function AdminRestaurantsPage() {
  const { data, isError, error } = useRestaurants();
  const createRestaurant = useCreateRestaurant();
  const updateRestaurant = useUpdateRestaurant();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [eta, setEta] = useState('');
  const [rating, setRating] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [createdRestaurantName, setCreatedRestaurantName] = useState('');
  const [staffLogin, setStaffLogin] = useState<StaffLoginDetails | null>(null);
  const { errors, applyParse, clearErrors } = useFormErrors();

  useToastQueryError(isError, error);

  function currentInput() {
    return {
      name,
      cuisine,
      address,
      description: description || undefined,
      ownerEmail,
      eta: eta || undefined,
      rating,
    };
  }

  function syncValidation(
    next: {
      name: string;
      cuisine: string;
      address: string;
      description?: string;
      ownerEmail: string;
      eta?: string;
      rating?: string;
    },
    forceShow = false,
  ) {
    return applyParse(parseRestaurant(next), forceShow);
  }

  function resetForm() {
    setName('');
    setCuisine('');
    setAddress('');
    setDescription('');
    setOwnerEmail('');
    setEta('');
    setRating('');
    setImageUrl(undefined);
    clearErrors();
  }

  async function handleCreate(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = currentInput();
    const parsed = parseRestaurant(input);
    if (!applyParse(parsed, true) || !parsed.success) return;

    try {
      const result = await createRestaurant.mutateAsync({
        ...parsed.data,
        imageUrl,
      });
      setShowForm(false);
      resetForm();
      if (result.staffLogin) {
        setCreatedRestaurantName(result.restaurant.name);
        setStaffLogin(result.staffLogin);
        setCredentialsOpen(true);
      }
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
          <label className="tg-label">Restaurant photo</label>
          <div style={{ marginBottom: 14 }}>
            <ImageUpload
              folder="restaurants"
              imageUrl={imageUrl}
              alt={name || 'New restaurant'}
              label="Upload photo"
              variant="hero"
              heroHeight={180}
              onUploaded={(url) => setImageUrl(url)}
              onError={toastError}
            />
          </div>

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

          <label className="tg-label">Restaurant email</label>
          <input
            className={`tg-input${errors.ownerEmail ? ' tg-input-invalid' : ''}`}
            type="email"
            value={ownerEmail}
            onChange={(e) => {
              const next = e.target.value;
              setOwnerEmail(next);
              syncValidation({ ...currentInput(), ownerEmail: next });
            }}
            placeholder="kitchen@restaurant.com"
            aria-invalid={Boolean(errors.ownerEmail)}
          />
          {errors.ownerEmail ? (
            <p className="tg-field-error" style={{ marginBottom: 8 }}>{errors.ownerEmail}</p>
          ) : (
            <p style={{ fontSize: 11.5, color: 'var(--tg-text-faint)', margin: '4px 0 12px' }}>
              Used for the staff login. Password will be the restaurant name + @123 (e.g. HastyTasty@123).
            </p>
          )}

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

          <label className="tg-label">Delivery time</label>
          <input
            className={`tg-input${errors.eta ? ' tg-input-invalid' : ''}`}
            value={eta}
            onChange={(e) => {
              const next = e.target.value;
              setEta(next);
              syncValidation({ ...currentInput(), eta: next });
            }}
            placeholder="25-35 min"
            aria-invalid={Boolean(errors.eta)}
          />
          {errors.eta ? <p className="tg-field-error" style={{ marginBottom: 8 }}>{errors.eta}</p> : <div style={{ marginBottom: 10 }} />}

          <label className="tg-label">Rating</label>
          <input
            className={`tg-input${errors.rating ? ' tg-input-invalid' : ''}`}
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={rating}
            onChange={(e) => {
              const next = e.target.value;
              setRating(next);
              syncValidation({ ...currentInput(), rating: next });
            }}
            placeholder="4.5"
            aria-invalid={Boolean(errors.rating)}
          />
          {errors.rating ? <p className="tg-field-error" style={{ marginBottom: 8 }}>{errors.rating}</p> : <div style={{ marginBottom: 10 }} />}

          <label className="tg-label">Description</label>
          <textarea
            className="tg-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional short description"
          />
          <div style={{ marginBottom: 12 }} />

          <button type="submit" className="tg-btn tg-btn-primary" disabled={createRestaurant.isPending}>
            {createRestaurant.isPending ? 'Creating…' : 'Create restaurant'}
          </button>
        </form>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 14,
        }}
      >
        {data?.items.map((r) => (
          <div key={r.id} className="tg-card" style={{ overflow: 'hidden', padding: 0 }}>
            <ImageUpload
              folder="restaurants"
              imageUrl={r.imageUrl}
              emoji={r.emoji}
              alt={r.name}
              label="Change photo"
              modalTitle={`Upload photo for ${r.name}`}
              variant="hero"
              heroHeight={180}
              disabled={updateRestaurant.isPending}
              onUploaded={async (url) => {
                try {
                  await updateRestaurant.mutateAsync({ id: r.id, input: { imageUrl: url } });
                  toastSuccess('Restaurant photo updated');
                } catch (err) {
                  toastApiError(err);
                }
              }}
              onError={toastError}
            />
            <div style={{ padding: '14px 16px 16px' }}>
              <p style={{ margin: 0, fontWeight: 500, fontSize: 15, color: 'var(--tg-text)' }}>
                {r.name}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12.5, color: 'var(--tg-text-muted)' }}>
                {r.cuisine}
                {r.eta ? ` · ${r.eta}` : ''}
                {r.rating != null ? ` · ★ ${r.rating}` : ''}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--tg-text-faint)' }}>
                {r.address}
              </p>
            </div>
          </div>
        ))}
      </div>

      <StaffCredentialsModal
        open={credentialsOpen}
        restaurantName={createdRestaurantName}
        staffLogin={staffLogin}
        onClose={() => {
          setCredentialsOpen(false);
          setStaffLogin(null);
        }}
      />
    </AppShell>
  );
}
