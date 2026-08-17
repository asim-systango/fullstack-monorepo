'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Dialog,
  DialogBody,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Field,
  Form,
  Skeleton,
  StatusMessage,
  TextInput,
} from '@shared/ui/components';
import { ApiClientError, type CreateExpenseInput } from '@shared/api-client';
import { useAuth } from '@/components/auth';
import {
  Avatar,
  ExpenseEditor,
  GroupExpensesPanel,
  GroupMembersPanel,
  WhoOwesPreview,
} from '@/components/splitter';
import { splitterApi } from '@/lib/api';
import {
  applyExpenseFilter,
  clearExpenseFilter,
  setExpenseFilterDraft,
  setExpenseLimit,
  setExpensePage,
  useAppDispatch,
  useAppSelector,
} from '@/lib/store';

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const groupId = params.id;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const filterDraft = useAppSelector((s) => s.ui.expenseFilterDraft);
  const filterApplied = useAppSelector((s) => s.ui.expenseFilterApplied);

  const [expenseOpen, setExpenseOpen] = useState<'create' | string | null>(null);
  const [expenseError, setExpenseError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteHint, setInviteHint] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [showAudit, setShowAudit] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null);

  const groupQuery = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => splitterApi.getGroup(groupId),
  });

  const expensesQuery = useQuery({
    queryKey: ['expenses', groupId, filterApplied],
    queryFn: () =>
      splitterApi.listExpenses(groupId, {
        limit: filterApplied.limit,
        page: filterApplied.page,
        from: filterApplied.from,
        to: filterApplied.to,
        payerUserId: filterApplied.payerUserId,
        q: filterApplied.q,
        category: filterApplied.category,
        sortBy: filterApplied.sortBy,
        sortDir: filterApplied.sortDir,
      }),
    enabled: Boolean(groupId),
  });

  const balancesQuery = useQuery({
    queryKey: ['balances', groupId],
    queryFn: () => splitterApi.getBalances(groupId),
    enabled: Boolean(groupId),
  });

  const invitesQuery = useQuery({
    queryKey: ['group-invites', groupId],
    queryFn: () => splitterApi.listGroupInvites(groupId),
    enabled: Boolean(groupId) && groupQuery.data?.myRole != null,
  });

  const deletedQuery = useQuery({
    queryKey: ['expenses-deleted', groupId],
    queryFn: () => splitterApi.listDeletedExpenses(groupId),
    enabled: showAudit && Boolean(groupId),
  });

  const editingExpense = useQuery({
    queryKey: ['expense', groupId, expenseOpen],
    queryFn: () => splitterApi.getExpense(groupId, String(expenseOpen)),
    enabled: Boolean(expenseOpen) && expenseOpen !== 'create',
  });

  function invalidateGroup() {
    void queryClient.invalidateQueries({ queryKey: ['group', groupId] });
    void queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
    void queryClient.invalidateQueries({ queryKey: ['balances', groupId] });
    void queryClient.invalidateQueries({ queryKey: ['groups'] });
    void queryClient.invalidateQueries({ queryKey: ['group-invites', groupId] });
    void queryClient.invalidateQueries({ queryKey: ['expenses-deleted', groupId] });
    void queryClient.invalidateQueries({ queryKey: ['settlements', groupId] });
  }

  const saveExpense = useMutation({
    mutationFn: (input: CreateExpenseInput) =>
      expenseOpen && expenseOpen !== 'create'
        ? splitterApi.updateExpense(groupId, expenseOpen, input)
        : splitterApi.createExpense(groupId, input),
    onSuccess: () => {
      setExpenseOpen(null);
      setExpenseError(null);
      invalidateGroup();
    },
    onError: (err) => {
      setExpenseError(
        err instanceof ApiClientError ? err.message : 'Could not save expense',
      );
    },
  });

  const deleteExpense = useMutation({
    mutationFn: (expenseId: string) => splitterApi.deleteExpense(groupId, expenseId),
    onSuccess: () => {
      setDeleteExpenseId(null);
      invalidateGroup();
    },
  });

  const sendInvite = useMutation({
    mutationFn: () => splitterApi.sendInvite(groupId, inviteEmail),
    onSuccess: () => {
      setInviteEmail('');
      setInviteError(null);
      setInviteHint('Invite sent.');
      invalidateGroup();
    },
    onError: (err) => {
      setInviteError(
        err instanceof ApiClientError ? err.message : 'Could not send invite',
      );
    },
  });

  const removeMember = useMutation({
    mutationFn: (userId: string) => splitterApi.removeMember(groupId, userId),
    onSuccess: () => {
      setRemoveMemberId(null);
      invalidateGroup();
    },
  });

  const blockGroup = useMutation({
    mutationFn: () => splitterApi.blockGroup(groupId),
    onSuccess: invalidateGroup,
  });

  const unblockGroup = useMutation({
    mutationFn: () => splitterApi.unblockGroup(groupId),
    onSuccess: invalidateGroup,
  });

  if (groupQuery.isLoading) {
    return (
      <div className="space-y-4" aria-hidden>
        <Skeleton size="lg" className="h-24 rounded-lg" />
        <Skeleton size="lg" className="h-40 rounded-lg" />
      </div>
    );
  }

  if (groupQuery.isError || !groupQuery.data) {
    return <StatusMessage tone="error">Group not found or access denied.</StatusMessage>;
  }

  const group = groupQuery.data;
  const isGroupAdmin = group.myRole === 'admin';
  const isMember = group.myRole != null;
  const isPlatformAdmin = user?.role === 'admin';
  const canMutate = isMember && !group.blocked;
  const members = group.members.map((m) => ({ userId: m.userId, name: m.name }));

  async function onLookup() {
    setInviteHint(null);
    setInviteError(null);
    try {
      const found = await splitterApi.lookupUser(inviteEmail);
      setInviteHint(`Registered user: ${found.name}`);
    } catch {
      setInviteHint('No account yet — they can register, then accept the invite.');
    }
  }

  function renderDeletedAudit() {
    if (deletedQuery.isLoading) {
      return <Skeleton size="lg" className="h-24 rounded-lg" />;
    }
    if (!deletedQuery.data?.length) {
      return (
        <EmptyState
          title="No deleted expenses"
          description="Soft-deleted items will appear here."
        />
      );
    }
    return (
      <ul className="overflow-hidden rounded-lg border border-border bg-card">
        {deletedQuery.data.map((expense) => (
          <li
            key={expense.id}
            className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 last:border-0"
          >
            <div>
              <p className="font-medium text-muted-foreground line-through">
                {expense.description}
              </p>
              <p className="text-xs text-muted-foreground">
                {expense.payer.name} ·{' '}
                {expense.deletedAt
                  ? new Date(expense.deletedAt).toLocaleDateString()
                  : 'deleted'}
              </p>
            </div>
            <Badge tone="danger">Deleted</Badge>
          </li>
        ))}
      </ul>
    );
  }

  const editing =
    expenseOpen && expenseOpen !== 'create' ? editingExpense.data : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/groups" className="text-sm text-muted-foreground">
            ← Groups
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <Avatar name={group.name} size="lg" />
            <div>
              <h2 className="text-2xl font-bold">{group.name}</h2>
              <p className="text-sm text-muted-foreground">
                {group.currency} · {group.members.length} members
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isPlatformAdmin ? (
            <Button
              variant="secondary"
              onClick={() =>
                group.blocked ? unblockGroup.mutate() : blockGroup.mutate()
              }
              loading={blockGroup.isPending || unblockGroup.isPending}
            >
              {group.blocked ? 'Unblock group' : 'Block group'}
            </Button>
          ) : null}
          {canMutate ? (
            <Button
              onClick={() => {
                setExpenseError(null);
                setExpenseOpen('create');
              }}
            >
              Add expense
            </Button>
          ) : null}
          <Link href={`/groups/${groupId}/balances`}>
            <Button variant="secondary">Settle up</Button>
          </Link>
        </div>
      </div>

      {group.blocked ? (
        <Alert tone="info">
          This group is blocked. You can still view expenses and balances, but new
          expenses, invites, and settlements are disabled.
        </Alert>
      ) : null}

      <WhoOwesPreview
        groupId={groupId}
        balances={balancesQuery.data}
        isLoading={balancesQuery.isLoading}
        currentUserId={user?.id}
        currency={group.currency}
      />

      <GroupExpensesPanel
        groupId={groupId}
        currency={group.currency}
        currentUserId={user?.id}
        members={members}
        canMutate={canMutate}
        canEdit={isGroupAdmin && canMutate}
        showAuditToggle={isGroupAdmin || isPlatformAdmin}
        showAudit={showAudit}
        onToggleAudit={() => setShowAudit((v) => !v)}
        filterDraft={filterDraft}
        filterApplied={filterApplied}
        onDraftChange={(patch) => dispatch(setExpenseFilterDraft(patch))}
        onApply={() => dispatch(applyExpenseFilter())}
        onClear={() => dispatch(clearExpenseFilter())}
        onPageChange={(page) => dispatch(setExpensePage(page))}
        onLimitChange={(limit) => dispatch(setExpenseLimit(limit))}
        page={expensesQuery.data}
        isLoading={expensesQuery.isLoading}
        isError={expensesQuery.isError}
        onAdd={() => {
          setExpenseError(null);
          setExpenseOpen('create');
        }}
        onEdit={(expenseId) => {
          setExpenseError(null);
          setExpenseOpen(expenseId);
        }}
        onDelete={(expenseId) => setDeleteExpenseId(expenseId)}
      />

      {showAudit ? (
        <section>
          <h3 className="mb-3 text-lg font-semibold">Deleted expenses</h3>
          {renderDeletedAudit()}
        </section>
      ) : null}

      <GroupMembersPanel
        members={group.members}
        currentUserId={user?.id}
        canRemove={isGroupAdmin && canMutate}
        onRemove={(userId) => setRemoveMemberId(userId)}
      />

      {canMutate ? (
        <section>
          <h3 className="mb-3 text-lg font-semibold">Invite people</h3>
          {group.blocked ? (
            <p className="text-sm text-muted-foreground">
              Invites are disabled while this group is blocked.
            </p>
          ) : (
            <Card className="splitter-shadow">
              <Form
                pending={sendInvite.isPending}
                onSubmit={(e) => {
                  e.preventDefault();
                  setInviteError(null);
                  sendInvite.mutate();
                }}
                className="space-y-3"
              >
                <Field label="Email" htmlFor="invite-email" required>
                  <TextInput
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="friend@example.com"
                  />
                </Field>
                {inviteHint ? (
                  <p className="text-sm text-muted-foreground">{inviteHint}</p>
                ) : null}
                {inviteError ? (
                  <StatusMessage tone="error">{inviteError}</StatusMessage>
                ) : null}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    loading={sendInvite.isPending}
                    disabled={!inviteEmail.trim()}
                  >
                    Send invite
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void onLookup()}
                  >
                    Look up
                  </Button>
                </div>
              </Form>
              {invitesQuery.data?.length ? (
                <ul className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                  {invitesQuery.data.map((invite) => (
                    <li key={invite.id} className="flex justify-between gap-2">
                      <span>{invite.inviteeEmail}</span>
                      <Badge tone="neutral">pending</Badge>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Card>
          )}
        </section>
      ) : null}

      <Dialog
        open={expenseOpen != null}
        onOpenChange={(open) => {
          if (!open) setExpenseOpen(null);
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {expenseOpen === 'create' ? 'Add expense' : 'Edit expense'}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          {expenseOpen && expenseOpen !== 'create' && editingExpense.isLoading ? (
            <Skeleton size="lg" className="h-40 rounded-lg" />
          ) : (
            <ExpenseEditor
              key={expenseOpen ?? 'closed'}
              members={members}
              currency={group.currency}
              currentUserId={user?.id ?? ''}
              initial={
                editing
                  ? {
                      description: editing.description,
                      amountCents: editing.amountCents,
                      payerUserId: editing.payer.id,
                      category: editing.category ?? '',
                      expenseDate: editing.expenseDate,
                      shares: editing.shares,
                    }
                  : undefined
              }
              pending={saveExpense.isPending}
              error={expenseError}
              submitLabel={expenseOpen === 'create' ? 'Add expense' : 'Save changes'}
              onSubmit={(input) => saveExpense.mutate(input)}
              onCancel={() => setExpenseOpen(null)}
            />
          )}
        </DialogBody>
      </Dialog>

      <Dialog
        open={deleteExpenseId != null}
        onOpenChange={() => setDeleteExpenseId(null)}
      >
        <DialogHeader>
          <DialogTitle>Delete expense?</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-muted-foreground">
            This hides the expense from the group list. Group admins can still see it in
            the deleted audit.
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => deleteExpenseId && deleteExpense.mutate(deleteExpenseId)}
              loading={deleteExpense.isPending}
            >
              Delete
            </Button>
            <Button variant="ghost" onClick={() => setDeleteExpenseId(null)}>
              Cancel
            </Button>
          </div>
        </DialogBody>
      </Dialog>

      <Dialog open={removeMemberId != null} onOpenChange={() => setRemoveMemberId(null)}>
        <DialogHeader>
          <DialogTitle>Remove member?</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-muted-foreground">
            They will lose access to this group. Existing expenses stay in the history.
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => removeMemberId && removeMember.mutate(removeMemberId)}
              loading={removeMember.isPending}
            >
              Remove
            </Button>
            <Button variant="ghost" onClick={() => setRemoveMemberId(null)}>
              Cancel
            </Button>
          </div>
        </DialogBody>
      </Dialog>
    </div>
  );
}
