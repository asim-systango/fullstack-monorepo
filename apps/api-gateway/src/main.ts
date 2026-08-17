import './load-env';
import 'reflect-metadata';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
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

/** Drop Nest's duplicate "successfully started" — we print one listen line. */
class GatewayBootstrapLogger extends ConsoleLogger {
  override log(message: unknown, context?: string): void {
    if (
      context === 'NestApplication' &&
      typeof message === 'string' &&
      message.includes('successfully started')
    ) {
      return;
    }
    super.log(message, context);
  }
}

async function bootstrap() {
  const appSettings = appConfig();
  const app = await NestFactory.create(AppModule, {
    logger: new GatewayBootstrapLogger(),
  });
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

  await setupSwagger(app, {
    title: 'BOOKLY API',
    description:
      'Unified API docs on the **gateway** (preferred). ' +
      'Auth (`/auth/*`, `/users/*`) runs here with cookie JWT; ' +
      'domain routes (`/books`, `/loans`, …) are proxied to apps/api. ' +
      '1) `POST /auth/login` 2) cookie is set 3) try domain routes. ' +
      'Internal `/internal/*` routes are omitted. ' +
      'Successful responses are wrapped as `{ data: ... }`.',
    auth: 'cookie-and-bearer',
    cookieName: 'access_token',
    mergeOpenApiFrom: `${appSettings.API_UPSTREAM_URL}/docs-json`,
    excludeMergedPathPrefixes: ['/internal'],
  });

  await app.listen(appSettings.PORT);
  console.log(`Running on http://localhost:${appSettings.PORT}`);
}

void bootstrap();
