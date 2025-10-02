import { z } from 'zod';

export const ChatSchema = z.object({
  id: z.number().optional(),
  title: z.string().optional(),
  contactId: z.uuid(),
  lastMessageId: z.number().optional(),
  createdAt: z.iso.datetime().optional(),
});

export type ChatType = z.infer<typeof ChatSchema>;