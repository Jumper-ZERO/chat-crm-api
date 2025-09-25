import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { FindManyOptions, In, Like, Between } from 'typeorm';
import { DataTableBaseDto } from '../../common/schemas/data-table-base.schema';

type RequiredQueryType = DataTableBaseDto & Record<string, unknown>;

const RESERVED_FIELDS = ['page', 'perPage', 'sort'];

export function buildQueryOptions(
  query: RequiredQueryType,
): { findOptions: FindManyOptions<any>; paginationOptions: IPaginationOptions } {
  const findOptions: FindManyOptions<any> = {};
  const where: Record<string, any> = {};

  const paginationOptions: IPaginationOptions = {
    page: query.page,
    limit: query.perPage,
  };

  if (query.sort && query.sort.length > 0) {
    findOptions.order = query.sort.reduce((acc, item) => {
      acc[item.id] = item.desc ? 'DESC' : 'ASC';
      return acc;
    }, {});
  }

  for (const [key, value] of Object.entries(query)) {
    if (RESERVED_FIELDS.includes(key) || value === undefined || value === null || value === '') {
      continue;
    }

    if (Array.isArray(value)) {

      const filterValues = value as unknown as string[];

      if (filterValues.length === 2 && (key.toLowerCase().includes('date') || key.toLowerCase().includes('at'))) {
        const startDate = new Date(parseInt(filterValues[0], 10));
        const endDate = new Date(parseInt(filterValues[1], 10));

        where[key] = Between(startDate, endDate);
      } else {
        where[key] = In(filterValues);
      }
    }
    else if (typeof value === 'string') {
      where[key] = Like(`%${value}%`);
    }
    else {
      where[key] = value;
    }
  }

  if (Object.keys(where).length > 0) {
    findOptions.where = where;
  }

  return { findOptions, paginationOptions };
}