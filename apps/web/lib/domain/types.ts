import { z } from 'zod';

export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  createdAt: z.string(),
});
export type Project = z.infer<typeof projectSchema>;

export const issueSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['todo', 'in_progress', 'done']),
  assigneeId: z.string().nullable(),
  sprintId: z.string().nullable(),
  createdAt: z.string(),
});
export type Issue = z.infer<typeof issueSchema>;

export const issueDetailSchema = issueSchema.extend({
  comments: z.array(
    z.object({
      id: z.string(),
      authorId: z.string(),
      body: z.string(),
      createdAt: z.string(),
    }),
  ),
  activity: z.array(
    z.object({
      id: z.string(),
      fromStatus: z.string().nullable(),
      toStatus: z.string(),
      userId: z.string(),
      createdAt: z.string(),
    }),
  ),
  labelIds: z.array(z.string()),
});
export type IssueDetail = z.infer<typeof issueDetailSchema>;

export const STATUS_COLUMNS = ['todo', 'in_progress', 'done'] as const;
const NEXT: Record<string, string[]> = {
  todo: ['in_progress'],
  in_progress: ['todo', 'done'],
  done: ['in_progress'],
};
export function nextStatuses(status: string): string[] {
  return NEXT[status] ?? [];
}
