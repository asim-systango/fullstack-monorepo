'use client';

import type { RestaurantDietType } from '@/lib/types/food-delivery';

export const DIET_TYPE_OPTIONS: { value: RestaurantDietType; label: string }[] = [
  { value: 'veg', label: 'Veg' },
  { value: 'non_veg', label: 'Non-veg' },
  { value: 'both', label: 'Veg & Non-veg' },
];

const LABELS: Record<RestaurantDietType, string> = {
  veg: 'Veg',
  non_veg: 'Non-veg',
  both: 'Veg & Non-veg',
};

function DietMark({ kind }: Readonly<{ kind: 'veg' | 'non_veg' }>) {
  const color = kind === 'veg' ? 'var(--tg-status-delivered-fg)' : 'var(--tg-status-cancelled-fg)';
  return (
    <span
      aria-hidden
      style={{
        width: 11,
        height: 11,
        border: `1.5px solid ${color}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: 'var(--tg-surface)',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: color,
        }}
      />
    </span>
  );
}

export function dietTypeLabel(type: RestaurantDietType): string {
  return LABELS[type];
}

export function DietBadge({ dietType = 'both' }: Readonly<{ dietType?: RestaurantDietType }>) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11.5,
        fontWeight: 500,
        color: 'var(--tg-text)',
      }}
    >
      {dietType === 'non_veg' ? (
        <DietMark kind="non_veg" />
      ) : dietType === 'both' ? (
        <>
          <DietMark kind="veg" />
          <DietMark kind="non_veg" />
        </>
      ) : (
        <DietMark kind="veg" />
      )}
      {LABELS[dietType]}
    </span>
  );
}

export function DietTypePicker({
  value,
  onChange,
  disabled = false,
}: Readonly<{
  value: RestaurantDietType;
  onChange: (next: RestaurantDietType) => void;
  disabled?: boolean;
}>) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
      {DIET_TYPE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`tg-btn tg-btn-pill ${value === option.value ? 'tg-btn-primary' : 'tg-btn-secondary'}`}
          disabled={disabled}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
