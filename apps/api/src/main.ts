import './load-env';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter, validationExceptionFactory } from '@shared/http/filters';
import { ResponseEnvelopeInterceptor } from '@shared/http/interceptors';
import { requestIdMiddleware } from '@shared/http/middleware';
import { setupSwagger } from '@shared/http/swagger';

async function bootstrap() {
  const port = process.env.PORT || 3002;
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.enableCors({ origin: true, credentials: true });

  app.use(compression());
  app.use(requestIdMiddleware());

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
    title: 'Domain API',
    description: 'Internal Nest API (Bearer JWT)',
    auth: 'bearer',
  });

  await app.listen(port);
  console.log(`Domain API listening on http://localhost:${port}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Swagger UI: http://localhost:${port}/docs`);
  }
}

void bootstrap();
