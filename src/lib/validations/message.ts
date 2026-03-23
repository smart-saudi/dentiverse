import { z } from 'zod';

/**
 * Schema for creating a new message in a case thread.
 */
export const createMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message too long'),
  attachment_urls: z.array(z.string().url()).max(10).default([]),
});

/**
 * Schema for listing messages in a case thread.
 */
export const messageListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(50),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type MessageListQuery = z.infer<typeof messageListQuerySchema>;
