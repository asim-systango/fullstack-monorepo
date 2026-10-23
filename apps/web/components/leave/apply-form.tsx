'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SyntheticEvent } from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  Field,
  Form,
  Select,
  TextArea,
  TextInput,
} from '@shared/ui/components';
import { useToast } from '@/components/feedback';
import { endOfYear } from '@/lib/leave/dates';
import { errorMessage, fieldErrors } from '@/lib/leave/errors';
import {
  useApplyLeave,
  useLeaveTypes,
  useMyBalances,
  useQuote,
} from '@/lib/leave/queries';
import type { Balance } from '@/lib/leave/types';
import {
  clearDraft,
  updateDraft,
  useAppDispatch,
  useAppSelector,
  type LeaveDraft,
} from '@/lib/store';
import { DaysLeftNote, WorkingDaysPreview } from './working-days-preview';

function typeLabel(name: string, balance: Balance | undefined) {
  if (!balance?.configured) return `${name} (not set)`;
  return `${name} (${balance.availableDays} days left)`;
}

export function ApplyForm() {
  const router = useRouter();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const draft = useAppSelector((state) => state.leaveDraft);
  const leaveTypes = useLeaveTypes();
  const balances = useMyBalances();
  const quote = useQuote(draft.startDate, draft.endDate);
  const apply = useApplyLeave();

  const balanceFor = (leaveTypeId: string) =>
    balances.data?.find((b) => b.leaveTypeId === leaveTypeId);
  const errors = fieldErrors(apply.error);
  const hasFieldErrors = Object.keys(errors).length > 0;

  function change(patch: Partial<LeaveDraft>) {
    if (apply.isError) apply.reset();
    dispatch(updateDraft(patch));
  }

  function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    apply.mutate(draft, {
      onSuccess: () => {
        dispatch(clearDraft());
        toast('Leave request sent, it is now pending approval');
        router.push('/leave');
      },
    });
  }

  return (
    <Card className="max-w-2xl">
      <CardBody>
        <Form pending={apply.isPending} onSubmit={onSubmit}>
          <Field
            label="Leave type"
            htmlFor="leave-type"
            required
            disabled={apply.isPending}
            error={errors.leaveTypeId}
          >
            <Select
              id="leave-type"
              value={draft.leaveTypeId}
              onChange={(e) => change({ leaveTypeId: e.target.value })}
            >
              <option value="">Choose a leave type</option>
              {(leaveTypes.data ?? []).map((type) => (
                <option key={type.id} value={type.id}>
                  {typeLabel(type.name, balanceFor(type.id))}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Start date"
              htmlFor="start-date"
              required
              disabled={apply.isPending}
              error={errors.startDate}
            >
              <TextInput
                id="start-date"
                type="date"
                value={draft.startDate}
                onChange={(e) => change({ startDate: e.target.value })}
              />
            </Field>
            <Field
              label="End date"
              htmlFor="end-date"
              required
              hint="Same year as the start date"
              disabled={apply.isPending}
              error={errors.endDate}
            >
              {/* min/max make the date picker block end-before-start and next year */}
              <TextInput
                id="end-date"
                type="date"
                value={draft.endDate}
                min={draft.startDate || undefined}
                max={draft.startDate ? endOfYear(draft.startDate) : undefined}
                onChange={(e) => change({ endDate: e.target.value })}
              />
            </Field>
          </div>

          <div className="mb-3 rounded-md border border-border bg-muted/40 px-3 py-2">
            <WorkingDaysPreview
              startDate={draft.startDate}
              endDate={draft.endDate}
              quote={quote.data}
              loading={quote.isFetching}
              error={quote.error}
            />
            <DaysLeftNote
              balance={balanceFor(draft.leaveTypeId)}
              requested={quote.data?.days}
            />
          </div>

          <Field
            label="Reason"
            htmlFor="reason"
            required
            disabled={apply.isPending}
            error={errors.reason}
          >
            <TextArea
              id="reason"
              rows={3}
              maxLength={500}
              value={draft.reason}
              onChange={(e) => change({ reason: e.target.value })}
            />
          </Field>

          {apply.isError && !hasFieldErrors ? (
            <Alert tone="danger" title="Not sent" className="mb-3">
              {errorMessage(apply.error)}
            </Alert>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" loading={apply.isPending} loadingText="Sending…">
              Send request
            </Button>
            <Button
              variant="ghost"
              disabled={apply.isPending}
              onClick={() => dispatch(clearDraft())}
            >
              Clear form
            </Button>
            <Link href="/leave" className="ml-auto text-sm">
              Back to my leave
            </Link>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
}
