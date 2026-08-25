import './load-env';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import compression from 'compression';
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
  app.use(requestIdMiddleware());
  app.use(securityHeadersMiddleware());

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

  setupSwagger(app, {
    title: 'TastyGo Domain API',
    description:
      'Internal Nest API (Bearer JWT) — restaurants, menu, cart, orders, payments. ' +
      'Authorize with a Bearer token (gateway forwards the auth cookie as Authorization).',
    auth: 'bearer',
  });

  await app.listen(appSettings.PORT);
  console.log(`Domain API listening on http://localhost:${appSettings.PORT}`);
  if (appSettings.NODE_ENV !== 'production') {
    console.log(`Swagger UI: http://localhost:${appSettings.PORT}/docs`);
  }
}

void bootstrap();
