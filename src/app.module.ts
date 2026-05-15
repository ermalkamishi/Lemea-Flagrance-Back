import { Module } from '@nestjs/common';
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

        return {
          type: 'postgres' as const,
          host: configService.get<string>('POSTGRES_HOST', 'localhost'),
          port,
          username: configService.get<string>('POSTGRES_USER', 'postgres'),
          password: configService.get<string>('POSTGRES_PASSWORD', 'postgres'),
          database: configService.get<string>('POSTGRES_DB', 'lemea_db'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*.js'],
          migrationsRun: runMigrationsOnBoot,
          synchronize: syncEnabled,
          logging:
            configService
              .get<string>('TYPEORM_LOGGING', 'false')
              .toLowerCase() === 'true',
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
