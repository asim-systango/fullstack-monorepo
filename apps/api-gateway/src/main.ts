import './load-env';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AUTH_COOKIE_NAME } from '@repo/env';
import { AppModule } from './app.module';
import { appConfig } from './config/app.config';
import {
  AllExceptionsFilter,
  validationExceptionFactory,
} from './common/filters/all-exceptions.filter';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';

function isGatewayOwnedPath(path: string): boolean {
  return (
    path === '/health' ||
    path.startsWith('/health/') ||
    path.startsWith('/auth') ||
    path.startsWith('/docs') ||
    path.startsWith('/swagger')
  );
}

async function bootstrap() {
  const appSettings = appConfig();
  const app = await NestFactory.create(AppModule);

  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    if (appSettings.COOKIE_SECURE) {
      res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    }
    next();
  });

  app.use(cookieParser());

  const corsOrigins = appSettings.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
  });

  // After cookieParser: forward domain routes to apps/api with Bearer JWT.
  app.use(
    createProxyMiddleware({
      target: appSettings.API_UPSTREAM_URL,
      changeOrigin: true,
      pathFilter: (pathname) => !isGatewayOwnedPath(pathname),
      on: {
        proxyReq: (proxyReq, req) => {
          const cookies = (req as Request).cookies as Record<string, string> | undefined;
          const token = cookies?.[AUTH_COOKIE_NAME];
          if (token) {
            proxyReq.setHeader('Authorization', `Bearer ${token}`);
          }
          proxyReq.removeHeader('cookie');
        },
      },
    }),
  );

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
      .setTitle('Fullstack API Gateway')
      .setDescription(
        'Cookie JWT BFF — auth on the gateway; domain routes proxy to apps/api',
      )
      .setVersion('1.0')
      .addCookieAuth('access_token')
      .build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));
  }

  await app.listen(appSettings.PORT);
  console.log(
    `API gateway listening on http://localhost:${appSettings.PORT} → upstream ${appSettings.API_UPSTREAM_URL}`,
  );
}

void bootstrap();
