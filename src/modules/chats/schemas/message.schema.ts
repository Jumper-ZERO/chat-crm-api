import { z } from 'zod';

export const MessageSchema = z.object({
  id: z.number().optional(),
  chatId: z.number(),
  senderId: z.number(),
  content: z.string().min(1, "El mensaje no puede estar vacío"),
  type: z.enum(["text", "image", "audio", "video", "document"]).default("text"),
  status: z.enum(["sent", "delivered", "read"]).default("sent"),
  createdAt: z.iso.datetime().optional(),
});

export type MessageType = z.infer<typeof MessageSchema>;