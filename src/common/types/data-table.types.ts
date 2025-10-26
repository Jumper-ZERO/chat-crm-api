export type SortItem = {
  id: string;
  desc: boolean;
};

export interface DataTableBaseQuery {
  page: number;
  perPage: number;
  sort: SortItem[];
}

export type TypeOrmQueryHelperInput = DataTableBaseQuery & Record<string, unknown>;