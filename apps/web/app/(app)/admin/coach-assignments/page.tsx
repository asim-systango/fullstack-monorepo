'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiClientError } from '@shared/api-client';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Field,
  Form,
  LoadingState,
  Page,
  PageHeader,
  Select,
  StatusMessage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@shared/ui/components';
import {
  createAssignment,
  deleteAssignment,
  fetchAssignments,
  fetchAthleteCandidates,
  fetchCoachCandidates,
  type CoachOrAthleteUser,
} from '@/lib/coach-api';
import { Trash2 } from 'lucide-react';

function userLabel(user: CoachOrAthleteUser): string {
  return user.name ? `${user.name}` : user.email;
}

function getErrorMessage(error: unknown): string {
  return error instanceof ApiClientError ? error.message : 'Failed to assign athlete';
}

const ASSIGNMENTS_QUERY_KEY = ['coach-assignments'];

export default function CoachAssignmentsPage() {
  const queryClient = useQueryClient();
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [coachUserId, setCoachUserId] = useState('');
  const [athleteUserId, setAthleteUserId] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const assignmentsQuery = useQuery({
    queryKey: ASSIGNMENTS_QUERY_KEY,
    queryFn: fetchAssignments,
  });
  const coachesQuery = useQuery({
    queryKey: [...ASSIGNMENTS_QUERY_KEY, 'coaches'],
    queryFn: fetchCoachCandidates,
  });
  const athletesQuery = useQuery({
    queryKey: [...ASSIGNMENTS_QUERY_KEY, 'athletes'],
    queryFn: fetchAthleteCandidates,
  });

  const assignMutation = useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY });
      setCoachUserId('');
      setAthleteUserId('');
      setShowAssignDialog(false);
    },
  });

  const unassignMutation = useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY });
    },
  });

  const candidatesLoaded = coachesQuery.isSuccess && athletesQuery.isSuccess;
  const canSubmit =
    candidatesLoaded &&
    coachUserId !== '' &&
    athleteUserId !== '' &&
    !assignMutation.isPending;

  function closeAssignDialog() {
    setShowAssignDialog(false);
    setCoachUserId('');
    setAthleteUserId('');
  }

  return (
    <Page>
      <PageHeader
        title="Coach assignments"
        description="Assign an athlete to a coach so the coach gets read-only visibility into their workouts and PRs."
        actions={
          <Button onClick={() => setShowAssignDialog(true)}>Assign athlete</Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Current assignments</CardTitle>
        </CardHeader>
        <CardBody>
          {assignmentsQuery.isLoading ? (
            <LoadingState variant="block" label="Loading assignments…" />
          ) : null}

          {assignmentsQuery.isError ? (
            <Alert tone="danger" title="Couldn't load assignments">
              <Button size="sm" onClick={() => void assignmentsQuery.refetch()}>
                Retry
              </Button>
            </Alert>
          ) : null}

          {assignmentsQuery.isSuccess && assignmentsQuery.data.length === 0 ? (
            <EmptyState
              title="No assignments yet"
              description="Click Assign athlete above to get started."
            />
          ) : null}

          {assignmentsQuery.isSuccess && assignmentsQuery.data.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Coach</TableHeaderCell>
                  <TableHeaderCell>Athlete</TableHeaderCell>
                  <TableHeaderCell>Assigned</TableHeaderCell>
                  <TableHeaderCell aria-label="Actions" />
                </TableRow>
              </TableHead>
              <TableBody>
                {assignmentsQuery.data.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{userLabel(assignment.coach)}</TableCell>
                    <TableCell>{userLabel(assignment.athlete)}</TableCell>
                    <TableCell>
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(assignment.id)}
                        aria-label={`Remove assignment of ${assignment.athlete.email} to ${assignment.coach.email}`}
                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardBody>
      </Card>

      <Dialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <DialogHeader>
          <DialogTitle>Remove assignment?</DialogTitle>
        </DialogHeader>
        <DialogBody>
          The coach will lose read-only access to this athlete&apos;s workouts and PRs.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setPendingDeleteId(null)}
            disabled={unassignMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={unassignMutation.isPending}
            loadingText="Removing…"
            onClick={() => {
              if (pendingDeleteId) unassignMutation.mutate(pendingDeleteId);
              setPendingDeleteId(null);
            }}
          >
            Remove
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog
        open={showAssignDialog}
        onOpenChange={(open) => !open && closeAssignDialog()}
      >
        <DialogHeader>
          <DialogTitle>Assign athlete</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {coachesQuery.isError || athletesQuery.isError ? (
            <Alert tone="danger" title="Couldn't load users">
              <Button
                size="sm"
                onClick={() => {
                  void coachesQuery.refetch();
                  void athletesQuery.refetch();
                }}
              >
                Retry
              </Button>
            </Alert>
          ) : null}

          {coachesQuery.isLoading || athletesQuery.isLoading ? (
            <LoadingState label="Loading users…" />
          ) : null}

          {candidatesLoaded ? (
            <Form
              pending={assignMutation.isPending}
              onSubmit={(e) => {
                e.preventDefault();
                if (!canSubmit) return;
                assignMutation.mutate({ coachUserId, athleteUserId });
              }}
              className="space-y-4"
            >
              <Field
                label="Coach"
                htmlFor="coach-select"
                required
                disabled={assignMutation.isPending}
              >
                <Select
                  id="coach-select"
                  value={coachUserId}
                  onChange={(e) => setCoachUserId(e.target.value)}
                >
                  <option value="">Select a coach…</option>
                  {coachesQuery.data.map((coach) => (
                    <option key={coach.id} value={coach.id}>
                      {userLabel(coach)}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Athlete"
                htmlFor="athlete-select"
                required
                disabled={assignMutation.isPending}
              >
                <Select
                  id="athlete-select"
                  value={athleteUserId}
                  onChange={(e) => setAthleteUserId(e.target.value)}
                >
                  <option value="">Select an athlete…</option>
                  {athletesQuery.data.map((athlete) => (
                    <option key={athlete.id} value={athlete.id}>
                      {userLabel(athlete)}
                    </option>
                  ))}
                </Select>
              </Field>

              {assignMutation.isError ? (
                <StatusMessage tone="error">
                  {getErrorMessage(assignMutation.error)}
                </StatusMessage>
              ) : null}

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeAssignDialog}
                  disabled={assignMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  loading={assignMutation.isPending}
                  loadingText="Assigning…"
                >
                  Assign athlete
                </Button>
              </DialogFooter>
            </Form>
          ) : null}
        </DialogBody>
      </Dialog>
    </Page>
  );
}
