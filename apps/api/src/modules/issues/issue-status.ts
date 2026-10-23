import type { IssueStatus } from './issue.entity';

const ALLOWED: Record<IssueStatus, readonly IssueStatus[]> = {
  todo: ['in_progress'],
  in_progress: ['todo', 'done'],
  done: ['in_progress'],
};

export function assertStatusTransition(from: IssueStatus, to: IssueStatus): void {
  if (from === to) {
    return;
  }
  if (!ALLOWED[from].includes(to)) {
    throw Object.assign(new Error(`Invalid status transition from ${from} to ${to}`), {
      isStatusError: true,
    });
  }
}

export function isAllowedStatusTransition(from: IssueStatus, to: IssueStatus): boolean {
  if (from === to) {
    return true;
  }
  return ALLOWED[from].includes(to);
}

export function allowedNextStatuses(from: IssueStatus): IssueStatus[] {
  return [...ALLOWED[from]];
}
