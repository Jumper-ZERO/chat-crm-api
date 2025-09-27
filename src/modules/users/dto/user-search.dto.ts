import { z } from "zod";

export const userSearchSchema = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().int().min(1).default(10),
});

export type UserSearchDto = z.infer<typeof userSearchSchema>;