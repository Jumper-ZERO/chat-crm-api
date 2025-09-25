import { z } from "zod";

export const userSearchSchema = z.object({
  query: z.string().min(1, "La consulta de búsqueda no puede estar vacía."),
  limit: z.coerce.number().int().min(1).default(10),
});

export type UserSearchDto = z.infer<typeof userSearchSchema>;