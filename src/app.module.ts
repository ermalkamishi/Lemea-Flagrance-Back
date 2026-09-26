import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { BotMetaMiddleware } from './common/middleware/bot-meta.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { AdminModule } from './admin/admin.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const syncEnabled =
          configService.get<string>('TYPEORM_SYNC', 'false').toLowerCase() ===
          'true';
        const runMigrationsOnBoot =
          configService
            .get<string>('TYPEORM_MIGRATIONS_RUN', 'false')
            .toLowerCase() === 'true';
        const portRaw = configService.get<string | number>(
          'POSTGRES_PORT',
          5432,
        );
        const port =
          typeof portRaw === 'number'
            ? portRaw
            : parseInt(String(portRaw), 10) || 5432;

        const databaseUrl = configService.get<string>('DATABASE_URL');
        const host = configService.get<string>('PGHOST') || configService.get<string>('POSTGRES_HOST', 'localhost');
        const portNum = configService.get<number>('PGPORT') || port;
        const username = configService.get<string>('PGUSER') || configService.get<string>('POSTGRES_USER', 'postgres');
        const password = configService.get<string>('PGPASSWORD') || configService.get<string>('POSTGRES_PASSWORD', 'postgres');
        const database = configService.get<string>('PGDATABASE') || configService.get<string>('POSTGRES_DB', 'lemea_db');

        return {
          type: 'postgres' as const,
          url: databaseUrl,
          host: !databaseUrl ? host : undefined,
          port: !databaseUrl ? portNum : undefined,
          username: !databaseUrl ? username : undefined,
          password: !databaseUrl ? password : undefined,
          database: !databaseUrl ? database : undefined,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*.js'],
          migrationsRun: runMigrationsOnBoot,
          synchronize: syncEnabled,
          logging:
            configService
              .get<string>('TYPEORM_LOGGING', 'false')
              .toLowerCase() === 'true',
          ssl: (databaseUrl || configService.get<string>('PGHOST')) ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    AdminModule,
    OrdersModule,
    ReviewsModule,
    CloudinaryModule,
    ContactModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BotMetaMiddleware).forRoutes('*');
  }
}
