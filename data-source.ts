import { DataSource } from "typeorm"

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['/src/modules/**/*.entity.{ts,js}'],
  migrations: ['/src/migrations/*.ts'],
  migrationsTableName: "migrations",
})