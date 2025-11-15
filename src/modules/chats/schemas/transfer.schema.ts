import { z } from 'zod';

export const TransferSchema = z.object({
  id: z.number().optional(),
  chatId: z.number(),
  fromAgentId: z.number(),
  toAgentId: z.number(),
  reason: z.string().optional(),
  createdAt: z.string().datetime().optional(),
});

export type TransferType = z.infer<typeof TransferSchema>;