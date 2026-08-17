'use client';

import { useState, type SyntheticEvent } from 'react';
import type { Category, TicketPriority } from '@shared/api-client';
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  StatusMessage,
  TextArea,
  TextInput,
} from '@shared/ui/components';
import { useCreateCategory, useUpdateCategory } from '@/lib/hooks/use-categories';

type SlaPolicyRow = {
  priority: TicketPriority;
  firstResponseHours: number;
  resolutionHours: number;
};

const DEFAULT_SLA_POLICIES: SlaPolicyRow[] = [
  { priority: 'urgent', firstResponseHours: 2, resolutionHours: 12 },
  { priority: 'high', firstResponseHours: 8, resolutionHours: 24 },
  { priority: 'medium', firstResponseHours: 24, resolutionHours: 72 },
  { priority: 'low', firstResponseHours: 48, resolutionHours: 120 },
];

export function CategoryForm({
  open,
  category,
  onClose,
}: Readonly<{
  open: boolean;
  category?: Category | null;
  onClose: () => void;
}>) {
  const isEditing = Boolean(category);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [slaPolicies, setSlaPolicies] = useState<SlaPolicyRow[]>(() => {
    if (category?.slaPolicies && category.slaPolicies.length > 0) {
      return category.slaPolicies.map((p) => ({
        priority: p.priority,
        firstResponseHours: p.firstResponseHours,
        resolutionHours: p.resolutionHours,
      }));
    }
    return DEFAULT_SLA_POLICIES;
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSlaChange = (
    priority: TicketPriority,
    field: 'firstResponseHours' | 'resolutionHours',
    val: number,
  ) => {
    setSlaPolicies((prev) =>
      prev.map((row) => (row.priority === priority ? { ...row, [field]: val } : row)),
    );
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        slaPolicies,
      };

      if (isEditing && category) {
        await updateMutation.mutateAsync({ id: category.id, input: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'An error occurred while saving category.',
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  let submitButtonText = 'Create Category';
  if (isPending) {
    submitButtonText = 'Saving...';
  } else if (isEditing) {
    submitButtonText = 'Save Changes';
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit Category: ${category?.name}` : 'Create New Category'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {errorMsg && <StatusMessage tone="error">{errorMsg}</StatusMessage>}

          <Field label="Category Name" required>
            <TextInput
              placeholder="e.g. Technical Support"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field
            label="Slug"
            optional
            hint="URL-friendly identifier. Auto-generated if left blank."
          >
            <TextInput
              placeholder="e.g. technical-support"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </Field>

          <Field label="Description" optional>
            <TextArea
              placeholder="Brief description of support category..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </Field>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">
              SLA Policy Target Hours Matrix
            </h4>
            <div className="border border-border rounded-md overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-muted text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-2">Priority</th>
                    <th className="p-2">First Response (hrs)</th>
                    <th className="p-2">Resolution (hrs)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {slaPolicies.map((row) => (
                    <tr key={row.priority}>
                      <td className="p-2 font-mono font-semibold capitalize">
                        {row.priority}
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min={1}
                          className="ui-text-input w-20 px-2 py-1 text-xs"
                          value={row.firstResponseHours}
                          onChange={(e) =>
                            handleSlaChange(
                              row.priority,
                              'firstResponseHours',
                              Number.parseInt(e.target.value, 10) || 1,
                            )
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min={1}
                          className="ui-text-input w-20 px-2 py-1 text-xs"
                          value={row.resolutionHours}
                          onChange={(e) =>
                            handleSlaChange(
                              row.priority,
                              'resolutionHours',
                              Number.parseInt(e.target.value, 10) || 1,
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isPending}>
            {submitButtonText}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
