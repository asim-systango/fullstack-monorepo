import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['admin', 'user', 'staff']),
});

export type User = z.infer<typeof userSchema>;

export const apiErrorSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.union([z.string(), z.array(z.string())]),
  details: z.array(z.object({ field: z.string(), message: z.string() })).optional(),
  correlationId: z.string().optional(),
});

export type ApiErrorBody = z.infer<typeof apiErrorSchema>;

export const ticketStatusSchema = z.enum(['open', 'pending', 'resolved', 'closed']);
export type TicketStatus = z.infer<typeof ticketStatusSchema>;

export const ticketPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export type TicketPriority = z.infer<typeof ticketPrioritySchema>;

export const ticketSchema = z.object({
  id: z.string().uuid(),
  ticketNumber: z.union([z.number(), z.string()]),
  subject: z.string(),
  status: ticketStatusSchema,
  priority: ticketPrioritySchema,
  categoryId: z.string().uuid(),
  categoryName: z.string().nullable().optional(),
  category: z
    .object({
      id: z.string(),
      name: z.string(),
      slug: z.string().optional(),
      description: z.string().nullable().optional(),
    })
    .optional(),
  userId: z.string().uuid(),
  assigneeId: z.string().uuid().nullable().optional(),
  version: z.number(),
  firstResponseDueAt: z.string().nullable().optional(),
  firstResponseAt: z.string().nullable().optional(),
  resolutionDueAt: z.string().nullable().optional(),
  resolvedAt: z.string().nullable().optional(),
  closedAt: z.string().nullable().optional(),
  slaBreached: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Ticket = z.infer<typeof ticketSchema>;

export const slaPolicySchema = z.object({
  priority: ticketPrioritySchema,
  firstResponseHours: z.number(),
  resolutionHours: z.number(),
});
export type SlaPolicy = z.infer<typeof slaPolicySchema>;

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  slaPolicies: z.array(slaPolicySchema).optional(),
});
export type Category = z.infer<typeof categorySchema>;

export const createTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(255),
  categoryId: z.string().uuid('Category is required'),
  priority: ticketPrioritySchema.optional().default('medium'),
  body: z.string().min(1, 'Message body is required'),
  metadata: z.record(z.unknown()).optional(),
});
export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const paginatedTicketsResponseSchema = z.object({
  items: z.array(ticketSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
export type PaginatedTicketsResponse = z.infer<typeof paginatedTicketsResponseSchema>;

export const ticketQueryParamsSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  categoryId: z.string().uuid().optional(),
  assigneeId: z.string().optional(),
  search: z.string().optional(),
});
export type TicketQueryParams = z.infer<typeof ticketQueryParamsSchema>;
