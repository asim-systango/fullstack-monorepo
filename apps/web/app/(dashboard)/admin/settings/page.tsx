'use client';

import React, { useState } from 'react';
import { RoleRoute } from '@/components/auth';
import {
  Page,
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Button,
  Field,
  TextInput,
} from '@shared/ui/components';
import { Sliders, CheckCircle2, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  // Settings form state
  const [settings, setSettings] = useState({
    slotWindowDays: 14,
    cancellationNoticeHours: 2,
    maxSlotsPerBulk: 50,
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <RoleRoute roles={['ADMIN', 'admin']}>
      <Page>
        <PageHeader
          title="System Settings"
          description="Configure operational parameters and hospital appointment preferences."
        />

        <div className="mt-6 max-w-2xl">
          {/* Operational Settings Form */}
          <Card>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sliders className="w-4 h-4 text-primary" />
                Operational Parameters
              </CardTitle>
            </CardHeader>
            <CardBody className="pt-4">
              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <Field label="Advance Slot Window (Days)">
                  <TextInput
                    type="number"
                    value={settings.slotWindowDays}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSettings({
                        ...settings,
                        slotWindowDays: Number(e.target.value),
                      })
                    }
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Max days doctors can create recurring slots in advance.
                  </p>
                </Field>

                <Field label="Cancellation Notice (Hours)">
                  <TextInput
                    type="number"
                    value={settings.cancellationNoticeHours}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSettings({
                        ...settings,
                        cancellationNoticeHours: Number(e.target.value),
                      })
                    }
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Minimum notice required for patient appointment cancellation.
                  </p>
                </Field>

                <Field label="Max Slots per Bulk Batch">
                  <TextInput
                    type="number"
                    value={settings.maxSlotsPerBulk}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSettings({
                        ...settings,
                        maxSlotsPerBulk: Number(e.target.value),
                      })
                    }
                  />
                </Field>

                {saveSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> System parameters updated
                    successfully!
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-full gap-1 text-xs"
                >
                  <Save className="w-3.5 h-3.5" /> Save System Settings
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </Page>
    </RoleRoute>
  );
}
