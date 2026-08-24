import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import express from 'express';

export const expressApp = express();

let isAppInitialized = false;

export async function setupApp(app: NestExpressApplication) {
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:5173',
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
}

// Handler for Vercel Serverless execution
export async function initializeServerless() {
  if (!isAppInitialized) {
    const { ExpressAdapter } = await import('@nestjs/platform-express');
    const app = await NestFactory.create<NestExpressApplication>(
      AppModule,
      new ExpressAdapter(expressApp),
    );
    await setupApp(app);
    await app.init();
    isAppInitialized = true;
  }
  return expressApp;
}

// Local Development execution
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  await setupApp(app);
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}

if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}