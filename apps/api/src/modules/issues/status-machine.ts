import { BadRequestException } from '@nestjs/common';
import type { IssueStatus } from './types';

const ALLOWED: Record<IssueStatus, IssueStatus[]> = {
  todo: ['in_progress'],
  in_progress: ['todo', 'done'],
  done: ['in_progress'],
};

export function assertTransition(from: IssueStatus, to: IssueStatus): void {
  if (!ALLOWED[from].includes(to)) {
    throw new BadRequestException(`Illegal status transition: ${from} → ${to}`);
  }
}
