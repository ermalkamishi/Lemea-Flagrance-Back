import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Product } from './products/entities/product.entity';
import { Category } from './categories/entities/category.entity';
import { Order } from './orders/entities/order.entity';
import { Review } from './reviews/entities/review.entity';

config({ path: '.env' });

const portRaw = process.env.POSTGRES_PORT ?? process.env.DB_PORT ?? '5432';
const port = Number.parseInt(String(portRaw), 10);
const safePort = Number.isFinite(port) ? port : 5432;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? process.env.DB_HOST ?? 'localhost',
  port: safePort,
  username: process.env.POSTGRES_USER ?? process.env.DB_USERNAME ?? 'postgres',
  password:
    process.env.POSTGRES_PASSWORD ?? process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.POSTGRES_DB ?? process.env.DB_NAME ?? 'lemea_db',
  entities: [User, Product, Category, Order, Review],
  migrations: [`${__dirname}/migrations/*.js`],
  synchronize: false,
  logging: process.env.TYPEORM_LOGGING === 'true',
});
