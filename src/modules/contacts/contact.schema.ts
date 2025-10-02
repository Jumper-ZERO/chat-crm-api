import { z } from 'zod';

export const ContactSchema = z.object({
  id: z.number().optional(),
  waId: z.string().optional(), // ID de WhatsApp
  name: z.string().optional(),
  phoneNumber: z.string(),
  email: z.string().optional(),
});

export type ContactType = z.infer<typeof ContactSchema>;
