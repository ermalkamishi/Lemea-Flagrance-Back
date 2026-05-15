"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const products_module_1 = require("./products/products.module");
const categories_module_1 = require("./categories/categories.module");
const admin_module_1 = require("./admin/admin.module");
const orders_module_1 = require("./orders/orders.module");
const reviews_module_1 = require("./reviews/reviews.module");
const cloudinary_module_1 = require("./cloudinary/cloudinary.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const syncEnabled = configService.get('TYPEORM_SYNC', 'false').toLowerCase() ===
                        'true';
                    const runMigrationsOnBoot = configService
                        .get('TYPEORM_MIGRATIONS_RUN', 'false')
                        .toLowerCase() === 'true';
                    const portRaw = configService.get('POSTGRES_PORT', 5432);
                    const port = typeof portRaw === 'number'
                        ? portRaw
                        : parseInt(String(portRaw), 10) || 5432;
                    return {
                        type: 'postgres',
                        host: configService.get('POSTGRES_HOST', 'localhost'),
                        port,
                        username: configService.get('POSTGRES_USER', 'postgres'),
                        password: configService.get('POSTGRES_PASSWORD', 'postgres'),
                        database: configService.get('POSTGRES_DB', 'lemea_db'),
                        entities: [__dirname + '/**/*.entity{.ts,.js}'],
                        migrations: [__dirname + '/migrations/*.js'],
                        migrationsRun: runMigrationsOnBoot,
                        synchronize: syncEnabled,
                        logging: configService
                            .get('TYPEORM_LOGGING', 'false')
                            .toLowerCase() === 'true',
                    };
                },
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            products_module_1.ProductsModule,
            categories_module_1.CategoriesModule,
            admin_module_1.AdminModule,
            orders_module_1.OrdersModule,
            reviews_module_1.ReviewsModule,
            cloudinary_module_1.CloudinaryModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map