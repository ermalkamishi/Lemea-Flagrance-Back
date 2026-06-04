import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as dns from 'node:dns';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Force IPv4 over IPv6 to fix ENETUNREACH errors on Railway when sending emails
dns.setDefaultResultOrder('ipv4first');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable global validation using class-validator decorators
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Allow all origins dynamically to prevent CORS issues with custom domains
  app.enableCors({
    origin: function (origin, callback) {
      callback(null, true);
    },
    credentials: true,
  });

  // Serve the uploads folder statically so images can be accessed via URL
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Lemea Flagrance API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `Application is running on: http://localhost:${process.env.PORT ?? 3000}`,
  );
}
void bootstrap();
