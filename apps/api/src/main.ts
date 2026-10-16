import './load-env';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { appConfig } from './config';
import { AllExceptionsFilter, validationExceptionFactory } from '@shared/http/filters';
import { ResponseEnvelopeInterceptor } from '@shared/http/interceptors';
import { requestIdMiddleware, securityHeadersMiddleware } from '@shared/http/middleware';
import { setupSwagger } from '@shared/http/swagger';

async function bootstrap() {
  const appSettings = appConfig();
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();

  app.use(compression());
  app.use(
    securityHeadersMiddleware({
      hsts: appSettings.COOKIE_SECURE,
    }),
  );
  app.use(cookieParser());
  app.use(requestIdMiddleware());

  const corsOrigins = appSettings.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
  });

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

  await setupSwagger(app, {
    title: 'BOOKLY API',
    description:
      'Unified Nest API — auth (`/auth/*`, `/users/*`) and domain routes (`/books`, `/loans`, …) in one process. ' +
      '1) `POST /auth/login` (cookie set) 2) call domain routes with cookie or Bearer. ' +
      'Successful responses are wrapped as `{ data: ... }`.',
    auth: 'cookie-and-bearer',
    cookieName: 'access_token',
  });

  await app.listen(appSettings.PORT);
  console.log(`API listening on http://localhost:${appSettings.PORT}`);
  if (appSettings.NODE_ENV !== 'production') {
    console.log(`Swagger UI: http://localhost:${appSettings.PORT}/docs`);
  }
}

void bootstrap();
