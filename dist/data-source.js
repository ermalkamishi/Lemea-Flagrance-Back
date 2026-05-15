"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const dotenv_1 = require("dotenv");
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./users/entities/user.entity");
const product_entity_1 = require("./products/entities/product.entity");
const category_entity_1 = require("./categories/entities/category.entity");
const order_entity_1 = require("./orders/entities/order.entity");
const review_entity_1 = require("./reviews/entities/review.entity");
(0, dotenv_1.config)({ path: '.env' });
const portRaw = process.env.POSTGRES_PORT ?? process.env.DB_PORT ?? '5432';
const port = Number.parseInt(String(portRaw), 10);
const safePort = Number.isFinite(port) ? port : 5432;
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST ?? process.env.DB_HOST ?? 'localhost',
    port: safePort,
    username: process.env.POSTGRES_USER ?? process.env.DB_USERNAME ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD ?? process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.POSTGRES_DB ?? process.env.DB_NAME ?? 'lemea_db',
    entities: [user_entity_1.User, product_entity_1.Product, category_entity_1.Category, order_entity_1.Order, review_entity_1.Review],
    migrations: [`${__dirname}/migrations/*.js`],
    synchronize: false,
    logging: process.env.TYPEORM_LOGGING === 'true',
});
//# sourceMappingURL=data-source.js.map