import './load-env';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import type { Request } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AppModule } from './app.module';
import { appConfig } from './config';
import {
  applyAuthCookieToProxyRequest,
  isGatewayOwnedPath,
  sendProxyError,
} from './common/proxy-hop';
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

  // After cookieParser: forward domain routes to apps/api with Bearer JWT.
  app.use(
    createProxyMiddleware({
      target: appSettings.API_UPSTREAM_URL,
      changeOrigin: true,
      proxyTimeout: 10_000,
      pathFilter: (pathname) => !isGatewayOwnedPath(pathname),
      on: {
        proxyReq: (proxyReq, req) => {
          applyAuthCookieToProxyRequest(proxyReq, req as Request);
        },
        error: (_err, _req, res) => {
          sendProxyError(res);
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

  setupSwagger(app, {
    title: 'API Gateway',
    description:
      'Cookie JWT BFF — auth on the gateway; domain routes proxy to apps/api. ' +
      'Use **Authorize** with the `access_token` cookie after `POST /auth/login`.',
    auth: 'cookie',
    cookieName: 'access_token',
  });

  await app.listen(appSettings.PORT);
  console.log(
    `API gateway listening on http://localhost:${appSettings.PORT} → upstream ${appSettings.API_UPSTREAM_URL}`,
  );
  if (appSettings.NODE_ENV !== 'production') {
    console.log(`Swagger UI: http://localhost:${appSettings.PORT}/docs`);
  }
}

void bootstrap();
