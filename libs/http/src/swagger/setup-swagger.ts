import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export type SwaggerAuthMode = 'cookie' | 'bearer';

export type SetupSwaggerOptions = {
  title: string;
  description: string;
  version?: string;
  /** Mount path (default `docs` → `/docs`). */
  path?: string;
  /** One or both of cookie / bearer (unified API uses both). */
  auth: SwaggerAuthMode | SwaggerAuthMode[];
  /** Cookie name when cookie auth is enabled (default `access_token`). */
  cookieName?: string;
};

/**
 * OpenAPI UI for local/dev Nest apps. Skipped when `enabled` is false
 * (typically production).
 */
export function setupSwagger(
  app: INestApplication,
  options: SetupSwaggerOptions,
  enabled = process.env.NODE_ENV !== 'production',
): void {
  if (!enabled) return;

  const modes = Array.isArray(options.auth) ? options.auth : [options.auth];

  const builder = new DocumentBuilder()
    .setTitle(options.title)
    .setDescription(options.description)
    .setVersion(options.version ?? '1.0');

  if (modes.includes('cookie')) {
    builder.addCookieAuth(options.cookieName ?? 'access_token');
  }
  if (modes.includes('bearer')) {
    builder.addBearerAuth();
  }

  const document = SwaggerModule.createDocument(app, builder.build());
  SwaggerModule.setup(options.path ?? 'docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
