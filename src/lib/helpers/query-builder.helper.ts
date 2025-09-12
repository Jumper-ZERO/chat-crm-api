import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export class QueryBuilderHelper<T extends ObjectLiteral> {
  constructor(private readonly qb: SelectQueryBuilder<T>) { }

  filter(condition: boolean, sql: string, params: Record<string, unknown>): QueryBuilderHelper<T> {
    if (condition) {
      this.qb.andWhere(sql, params);
    }
    return this;
  }

  filterByColumn<K extends keyof T>(
    condition: boolean,
    column: K,
    operator: '=' | 'LIKE' | 'IN' | '>' | '<' | '>=' | '<=' | '!=',
    value: string | number | boolean | string[] | number[],
    alias?: string
  ): QueryBuilderHelper<T> {
    if (condition) {
      const columnName = alias ? `${alias}.${String(column)}` : String(column);
      const paramName = String(column);

      let sql: string;
      let params: Record<string, unknown>;

      switch (operator) {
        case 'LIKE':
          sql = `${columnName} LIKE :${paramName}`;
          params = { [paramName]: `%${String(value)}%` };
          break;
        case 'IN':
          sql = `${columnName} IN (:...${paramName})`;
          params = { [paramName]: value };
          break;
        default:
          sql = `${columnName} ${operator} :${paramName}`;
          params = { [paramName]: value };
      }

      this.qb.andWhere(sql, params);
    }
    return this;
  }

  sort(
    column: keyof T | undefined,
    desc: boolean | undefined,
  ): QueryBuilderHelper<T> {
    const alias = this.qb.alias;

    if (column) {
      this.qb.orderBy(`${this.qb.alias}.${String(column)}`, desc ? 'DESC' : 'ASC');
      this.qb.addOrderBy(`${this.qb.alias}.id`, 'ASC');
    } else {
      this.qb.orderBy(`${alias}.createdAt`, 'DESC');
    }

    return this;
  }

  build(): SelectQueryBuilder<T> {
    return this.qb;
  }
}