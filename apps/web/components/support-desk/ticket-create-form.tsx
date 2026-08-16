'use client';

import { useState, type SyntheticEvent } from 'react';
import type { TicketPriority } from '@shared/api-client';
import {
  Alert,
  Button,
  Card,
  Field,
  Select,
  TextArea,
  TextInput,
} from '@shared/ui/components';
import { useCategories } from '@/lib/hooks/use-categories';
import { useCreateTicket } from '@/lib/hooks/use-tickets';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import {
  resetDraft,
  setBody,
  setCategoryId,
  setPriority,
  setSubject,
} from '@/lib/store/create-ticket-draft-slice';

export function TicketCreateForm({
  onSuccess,
  onCancel,
}: Readonly<{
  onSuccess?: () => void;
  onCancel?: () => void;
}>) {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((state) => state.createTicketDraft);
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const createTicketMutation = useCreateTicket();

  const [validationErrors, setValidationErrors] = useState<{
    subject?: string;
    categoryId?: string;
    body?: string;
  }>({});

  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    setServerError(null);

    const errors: typeof validationErrors = {};
    if (!draft.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    if (!draft.categoryId) {
      errors.categoryId = 'Category is required';
    }
    if (!draft.body.trim()) {
      errors.body = 'Message body cannot be empty';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    createTicketMutation.mutate(
      {
        subject: draft.subject.trim(),
        categoryId: draft.categoryId,
        priority: draft.priority,
        body: draft.body.trim(),
      },
      {
        onSuccess: () => {
          dispatch(resetDraft());
          onSuccess?.();
        },
        onError: (err) => {
          setServerError(
            err instanceof Error
              ? err.message
              : 'Failed to create ticket. Please check your input and try again.',
          );
        },
      },
    );
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4 text-foreground">Create Support Ticket</h2>
      {serverError && (
        <Alert tone="danger" title="Submission Error" className="mb-4">
          {serverError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Category"
          required
          htmlFor="categoryId"
          error={validationErrors.categoryId}
          hint="Select the topic that best matches your request"
        >
          <Select
            id="categoryId"
            value={draft.categoryId}
            disabled={isCategoriesLoading}
            onChange={(e) => dispatch(setCategoryId(e.target.value))}
          >
            <option value="">
              {isCategoriesLoading ? 'Loading categories…' : '-- Select Category --'}
            </option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Priority" htmlFor="priority" hint="Default is medium">
          <Select
            id="priority"
            value={draft.priority}
            onChange={(e) => dispatch(setPriority(e.target.value as TicketPriority))}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </Field>

        <Field
          label="Subject"
          required
          htmlFor="subject"
          error={validationErrors.subject}
          hint="Brief summary of the issue"
        >
          <TextInput
            id="subject"
            placeholder="e.g. Cannot access dashboard"
            value={draft.subject}
            onChange={(e) => dispatch(setSubject(e.target.value))}
          />
        </Field>

        <Field
          label="Message Body"
          required
          htmlFor="body"
          error={validationErrors.body}
          hint="Provide details to help us investigate"
        >
          <TextArea
            id="body"
            rows={5}
            placeholder="Describe your issue in detail..."
            value={draft.body}
            onChange={(e) => dispatch(setBody(e.target.value))}
          />
        </Field>

        <div className="flex justify-end space-x-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={createTicketMutation.isPending}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            loading={createTicketMutation.isPending}
            loadingText="Submitting ticket..."
          >
            Submit Ticket
          </Button>
        </div>
      </form>
    </Card>
  );
}
