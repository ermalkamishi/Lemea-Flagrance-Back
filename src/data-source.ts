import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Category } from './categories/entities/category.entity';
import { Order } from './orders/entities/order.entity';
import { Review } from './reviews/entities/review.entity';

config({ path: '.env' });

/**
 * DataSource used by the TypeORM CLI (npm run migration:*).
 * Resolves the connection the same way as app.module.ts:
 *   1. DATABASE_URL (Railway)
 *   2. PG* variables (Railway)
 *   3. POSTGRES_* / legacy DB_* variables (local)
 */
const env = process.env;
const databaseUrl = env.DATABASE_URL;

const portRaw = env.PGPORT ?? env.POSTGRES_PORT ?? env.DB_PORT ?? '5432';
const port = Number.parseInt(String(portRaw), 10);
const safePort = Number.isFinite(port) ? port : 5432;

const useSsl = Boolean(databaseUrl || env.PGHOST);

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(databaseUrl
    ? { url: databaseUrl }
    : {
        host: env.PGHOST ?? env.POSTGRES_HOST ?? env.DB_HOST ?? 'localhost',
        port: safePort,
        username: env.PGUSER ?? env.POSTGRES_USER ?? env.DB_USERNAME ?? 'postgres',
        password: env.PGPASSWORD ?? env.POSTGRES_PASSWORD ?? env.DB_PASSWORD ?? 'postgres',
        database: env.PGDATABASE ?? env.POSTGRES_DB ?? env.DB_NAME ?? 'lemea_db',
      }),
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  entities: [User, Product, Category, Order, Review],
  migrations: [`${__dirname}/migrations/*.js`],
  synchronize: false,
  logging: env.TYPEORM_LOGGING === 'true',
});
