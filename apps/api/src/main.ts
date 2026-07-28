import './load-env';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { appConfig } from './config/app.config';
import {
  AllExceptionsFilter,
  ResponseEnvelopeInterceptor,
  validationExceptionFactory,
} from '@shared/http';

async function bootstrap() {
  const appSettings = appConfig();
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
  });

  // Internal service — browser CORS/cookies live on api-gateway only.

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: validationExceptionFactory,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());

  if (appSettings.NODE_ENV !== 'production') {
    const swagger = new DocumentBuilder()
      .setTitle('Fullstack Domain API')
      .setDescription(
        'Internal Nest API (Bearer JWT) — add domain modules under src/modules/',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));
  }

  await app.listen(appSettings.PORT);
  console.log(`Domain API listening on http://localhost:${appSettings.PORT}`);
}

void bootstrap();
