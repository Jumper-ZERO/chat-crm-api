import { z } from "zod";
import { createTableQuerySchema } from "./create-table-query.schema";
import { commaSeparatedStringTransformer } from "../../common/utils/zod-transforms";

const contactFiltersShape = {
  name: z.string().optional(),
  phone: z.string().optional(),

  status: commaSeparatedStringTransformer,
  assignedTo: commaSeparatedStringTransformer,

  createdAt: z.string().optional(),
};

export const contactTableQuerySchema = createTableQuerySchema(contactFiltersShape);

export type ContactTableQueryDto = z.infer<typeof contactTableQuerySchema>;