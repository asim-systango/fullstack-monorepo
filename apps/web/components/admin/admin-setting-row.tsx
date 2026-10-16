'use client';

import { useEffect, useState } from 'react';
import type { AppSetting } from '@shared/types';
import { Alert, Button, TextInput, StatusMessage } from '@shared/ui/components';
import { toUserMessage } from '@/lib/auth/errors';
import { useUpdateSetting } from '@/lib/bookly';
import { formatMoneyInr } from '@/lib/member/format';
import { isMoneyCentsSetting, settingHint, settingLabel } from './setting-labels';

export function AdminSettingRow({ setting }: Readonly<{ setting: AppSetting }>) {
  const update = useUpdateSetting();
  const [value, setValue] = useState(setting.value);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(setting.value);
  }, [setting.value]);

  const dirty = value !== setting.value;
  const moneyHint = isMoneyCentsSetting(setting.key)
    ? `Currently ${formatMoneyInr(Number.parseInt(setting.value, 10) || 0)} per day.`
    : null;

  async function onSave() {
    setError(null);
    setSaved(false);
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Value is required.');
      return;
    }
    try {
      await update.mutateAsync({ key: setting.key, input: { value: trimmed } });
      setSaved(true);
    } catch (err) {
      setError(toUserMessage(err));
    }
  }

  return (
    <li className="admin-setting-row">
      <div className="min-w-0 flex-1">
        <p className="m-0 font-medium text-[color:var(--bookly-navy)]">
          {settingLabel(setting.key)}
        </p>
        <p className="m-0 mt-0.5 text-sm text-[color:var(--bookly-muted)]">
          {settingHint(setting.key, setting.description)}
        </p>
        {moneyHint ? (
          <p className="m-0 mt-1 text-xs text-[color:var(--bookly-muted)]">{moneyHint}</p>
        ) : null}
        {error ? (
          <Alert tone="danger" title="Could not save setting" className="mt-2">
            {error}
          </Alert>
        ) : null}
        {saved && !dirty && !error ? (
          <StatusMessage tone="success" className="mt-2">
            Saved
          </StatusMessage>
        ) : null}
      </div>
      <div className="admin-setting-controls">
        <TextInput
          aria-label={settingLabel(setting.key)}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
            setError(null);
          }}
          disabled={update.isPending}
          className="w-28"
        />
        <Button
          variant="primary"
          size="sm"
          disabled={update.isPending || !dirty}
          onClick={() => void onSave()}
        >
          {update.isPending ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </li>
  );
}
