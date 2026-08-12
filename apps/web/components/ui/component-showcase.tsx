'use client';

import { useState } from 'react';
import { Button, Dropdown, Input, Select, Toggle } from '@/components/ui';

const tagOptions = [
  { value: 'tech', label: 'Technology' },
  { value: 'design', label: 'Design' },
  { value: 'culture', label: 'Culture' },
];

export function ComponentShowcase() {
  const [notifications, setNotifications] = useState(true);

  return (
    <section className="mt-12 space-y-8 border-t border-border pt-10">
      <div>
        <h2 className="text-2xl leading-tight">Core components</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Medium-inspired primitives from <code>components/ui</code>.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="brand">Publish</Button>
        <Button variant="outline">Follow</Button>
        <Button variant="ghost">Ghost</Button>
        <Button loading loadingText="Saving…">
          Save
        </Button>
      </div>

      <div className="grid max-w-xl gap-4">
        <Input label="Title" name="title" placeholder="Write a title…" required />
        <Select label="Tag" name="tag" placeholder="Choose a tag" options={tagOptions} />
        <Toggle
          label="Email notifications"
          checked={notifications}
          onCheckedChange={setNotifications}
        />
      </div>

      <Dropdown
        trigger={
          <Button variant="outline" size="sm">
            More actions ▾
          </Button>
        }
        items={[
          { id: 'edit', label: 'Edit story' },
          { id: 'share', label: 'Share' },
          { id: 'delete', label: 'Delete', disabled: true },
        ]}
      />
    </section>
  );
}
