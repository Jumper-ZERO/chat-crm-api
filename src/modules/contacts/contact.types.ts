// src/modules/contacts/contact.types.ts

import { DataTableBaseQuery } from "../../common/types/data-table.types";

export interface ContactFilters {
  name: string;
  phone: string;
  status: string | string[];
  assignedTo: string | string[];
  createdAt: string;
}

export type ContactQueryDto = DataTableBaseQuery & Partial<ContactFilters>;