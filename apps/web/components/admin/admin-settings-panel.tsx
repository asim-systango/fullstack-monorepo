'use client';

import { Alert, Skeleton } from '@shared/ui/components';
import { toUserMessage } from '@/lib/auth/errors';
import { useSettings } from '@/lib/bookly';
import { formatMoneyInr } from '@/lib/member/format';
import { AdminEmptyState } from './admin-empty-state';
import { AdminSettingRow } from './admin-setting-row';
import { isMoneyCentsSetting, settingLabel } from './setting-labels';

export function AdminSettingsPanel({
  editable = true,
}: Readonly<{ editable?: boolean }>) {
  const settings = useSettings();

  return (
    <section id="settings" className="admin-panel admin-card">
      <div className="px-4 pt-4 pb-2 sm:px-5">
        <h2 className="admin-section-title">Library policies</h2>
        <p className="admin-section-desc">Borrowing and fine configuration.</p>
      </div>
      <div className="admin-panel-body">
        {settings.isPending ? (
          <div className="space-y-2">
            <Skeleton size="md" />
            <Skeleton size="md" />
          </div>
        ) : null}
        {settings.isError ? (
          <Alert tone="danger" title="Could not load settings">
            {toUserMessage(settings.error)}
          </Alert>
        ) : null}
        {settings.data && settings.data.length === 0 ? (
          <AdminEmptyState
            title="No library policies configured"
            description="Configured policies will appear here."
          />
        ) : null}
        {settings.data && settings.data.length > 0 ? (
          <ul className="m-0 list-none p-0">
            {editable
              ? settings.data.map((setting) => (
                  <AdminSettingRow key={setting.id} setting={setting} />
                ))
              : settings.data.map((setting) => (
                  <li key={setting.id} className="admin-row">
                    <div className="min-w-0 flex-1">
                      <p className="m-0 font-medium">{settingLabel(setting.key)}</p>
                    </div>
                    <p className="m-0 font-semibold tabular-nums">
                      {isMoneyCentsSetting(setting.key)
                        ? formatMoneyInr(Number.parseInt(setting.value, 10) || 0)
                        : setting.value}
                    </p>
                  </li>
                ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
