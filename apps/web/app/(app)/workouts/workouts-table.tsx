'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Badge,
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '@shared/ui/components';
import type { Workout } from '@/lib/workouts-api';
import { PencilIcon, Trash2 } from 'lucide-react';

export type WorkoutsTableProps = Readonly<{
  workouts: Workout[];
  onDelete: (id: string) => void;
  deletePending: boolean;
}>;

export function WorkoutsTable({ workouts, onDelete, deletePending }: WorkoutsTableProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Workout Name</TableHeaderCell>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Exercises</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {workouts.map((workout) => (
            <TableRow key={workout.id}>
              <TableCell>
                <span className="text-black font-semibold"> {workout.title}</span>
              </TableCell>
              <TableCell>{new Date(workout.performedAt).toLocaleDateString()}</TableCell>
              <TableCell>
                {workout.exerciseLogs.length > 0 &&
                  workout.exerciseLogs.map((exercise) => (
                    <Badge
                      key={exercise.id}
                      className="mr-2 bg-primary/10 text-gray border rounded-md "
                    >
                      {exercise?.exerciseName}:{' '}
                      <span className="text-black">{exercise?.sets?.length}</span>
                    </Badge>
                  ))}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/workouts/${workout.id}/edit`}
                    aria-label={`Edit ${workout.title}`}
                    className="text-muted-foreground hover:text-primary rounded-md transition-all group cursor-pointer bg-gray-200 hover:bg-primary/20 p-2"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Link>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-primary rounded-md transition-all group cursor-pointer bg-gray-200 hover:bg-primary/20 p-2"
                    onClick={() => setPendingDeleteId(workout.id)}
                    aria-label={`Delete ${workout.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
      >
        <DialogHeader>
          <DialogTitle>Delete workout?</DialogTitle>
        </DialogHeader>
        <DialogBody>
          This removes it from your history. This cannot be undone from here.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setPendingDeleteId(null)}
            disabled={deletePending}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={deletePending}
            loadingText="Deleting…"
            onClick={() => {
              if (pendingDeleteId) onDelete(pendingDeleteId);
              setPendingDeleteId(null);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
