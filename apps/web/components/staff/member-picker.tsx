import type { MemberSearchHit } from '@shared/types';
import { Alert, Button, Field, TextInput } from '@shared/ui/components';

export function MemberPicker({
  query,
  onQueryChange,
  hits,
  selectedId,
  selectedName,
  selectedEmail,
  selectedMeta,
  warning,
  onSelect,
  onClear,
  disabled,
  error,
  inputId = 'member-picker',
  placeholder = 'Search name, email, or member ID…',
}: Readonly<{
  query: string;
  onQueryChange: (value: string) => void;
  hits?: MemberSearchHit[];
  selectedId: string | null;
  selectedName?: string | null;
  selectedEmail?: string | null;
  selectedMeta?: string | null;
  warning?: string | null;
  onSelect: (hit: MemberSearchHit) => void;
  onClear: () => void;
  disabled?: boolean;
  error?: string | null;
  inputId?: string;
  placeholder?: string;
}>) {
  if (selectedId) {
    return (
      <div className="staff-selected-card">
        <div className="min-w-0 flex-1">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.06em] text-[color:var(--bookly-muted)]">
            Selected member
          </p>
          <p className="m-0 mt-1 font-medium text-[color:var(--bookly-navy)]">
            {selectedName ?? 'Selected member'}
          </p>
          {selectedEmail ? (
            <p className="m-0 mt-1 text-sm text-[color:var(--bookly-muted)]">{selectedEmail}</p>
          ) : null}
          {selectedMeta ? (
            <p className="m-0 mt-2 text-sm text-[color:var(--bookly-muted)]">{selectedMeta}</p>
          ) : null}
          {warning ? (
            <p className="m-0 mt-2 text-sm text-[color:var(--staff-warn)]">{warning}</p>
          ) : null}
        </div>
        {!disabled ? (
          <Button type="button" size="sm" variant="secondary" onClick={onClear}>
            Change
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <Field label="Member" htmlFor={inputId}>
        <TextInput
          id={inputId}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          disabled={disabled}
        />
      </Field>
      {error ? (
        <Alert tone="danger" title="Member search failed">
          {error}
        </Alert>
      ) : null}
      {hits && hits.length > 0 ? (
        <ul className="staff-result-list">
          {hits.map((hit) => (
            <li key={hit.userId}>
              <button
                type="button"
                className="staff-pick-row"
                aria-pressed={selectedId === hit.userId}
                onClick={() => onSelect(hit)}
              >
                <div className="min-w-0 flex-1">
                  <p className="m-0 font-medium">{hit.fullName}</p>
                  <p className="m-0 text-sm text-[color:var(--bookly-muted)]">
                    {hit.email} · {hit.activeLoanCount} active loan(s)
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
