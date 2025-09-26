import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { FindManyOptions, In, Between, Like } from 'typeorm';
import { TypeOrmQueryHelperInput } from '../../common/types/data-table.types';

// Campos que ignoramos al construir la cláusula WHERE
const RESERVED_FIELDS = ['page', 'perPage', 'sort'];

export function buildQueryOptions(
  query: TypeOrmQueryHelperInput,
): { findOptions: FindManyOptions<any>; paginationOptions: IPaginationOptions } {

  const findOptions: FindManyOptions<any> = { where: {}, order: {} };

  // 1. ORDENACIÓN (ORDER BY)
  if (query.sort && query.sort.length > 0) {
    findOptions.order = query.sort.reduce((acc, item) => {
      // Convierte [{ id: 'col', desc: true }] a { col: 'DESC' }
      if (item?.id) { // Asegurarse de que el id exista
        // Convierte [{ id: 'col', desc: true }] a { col: 'DESC' }
        acc[item.id] = item.desc ? 'DESC' : 'ASC';
      }
      return acc;
    }, {});
  }

  // 2. FILTROS (WHERE)
  for (const [key, value] of Object.entries(query)) {
    if (RESERVED_FIELDS.includes(key) || value === undefined || value === null) {
      continue;
    }

    // A. Filtro de ARRAY (ej: status: ['active', 'inactive']) -> IN ('active', 'inactive')
    if (Array.isArray(value)) {
      (findOptions.where!)[key] = In(value);
      continue;
    }

    // B. Filtro de STRING
    if (typeof value === 'string') {

      // B.1. Rango de Fechas (ej: createdAt: "175808...,175808...")
      const isDateRange = (key.toLowerCase().includes('at') || key.toLowerCase().includes('date')) && value.includes(',');

      if (isDateRange) {
        const parts = value.split(',');
        if (parts.length === 2) {
          // Convertir timestamps de string a objetos Date
          const startDate = new Date(parseInt(parts[0], 10));
          const endDate = new Date(parseInt(parts[1], 10));
          (findOptions.where!)[key] = Between(startDate, endDate);
          continue;
        }
      }

      // B.2. Búsqueda de Texto (ej: name: "John") -> LIKE %John%
      (findOptions.where!)[key] = Like(`%${value}%`);
      continue;
    }
  }

  // 3. PAGINACIÓN
  const paginationOptions: IPaginationOptions = {
    limit: query.perPage,
    page: query.page,
  };

  return { findOptions, paginationOptions };
}