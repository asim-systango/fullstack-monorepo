import type { IssueStatus } from './domain-types';

export const STATUS_LABEL: Record<IssueStatus, string> = {
  todo: 'Todo',
  in_progress: 'In progress',
  done: 'Done',
};

export const ALLOWED_TRANSITIONS: Record<IssueStatus, IssueStatus[]> = {
  todo: ['in_progress'],
  in_progress: ['todo', 'done'],
  done: ['in_progress'],
};
