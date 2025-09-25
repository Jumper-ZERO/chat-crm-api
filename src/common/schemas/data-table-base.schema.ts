/* eslint-disable @typescript-eslint/no-unsafe-return */
import { z } from "zod";

const sortItemSchema = z.object({
  id: z.string(),
  desc: z.boolean().optional().default(false),
});

const safeJsonParse = (val: unknown) => {
  if (typeof val !== 'string' || !val) {
    return val;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(val);
  } catch {
    return val;
  }

  if (typeof parsed === 'string') {
    try {
      return JSON.parse(parsed);
    } catch {
      return val;
    }
  }

  return parsed;
};

export const dataTableBaseSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).default(10),

  sort: z
    .preprocess(safeJsonParse,
      z.array(sortItemSchema)
    )
    .optional()
    .default([]),
});

export type DataTableBaseDto = z.infer<typeof dataTableBaseSchema>;