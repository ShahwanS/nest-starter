import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

export const appDataSource = new DataSource({
  type: (process.env.DB_TYPE as any) || 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  ssl: process.env.SSL === 'true' ? { rejectUnauthorized: false } : false,
} as DataSourceOptions);
