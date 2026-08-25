import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export type SwaggerAuthMode = 'cookie' | 'bearer';

export type SetupSwaggerOptions = {
  title: string;
  description: string;
  version?: string;
  path?: string;
  auth: SwaggerAuthMode | SwaggerAuthMode[];
  cookieName?: string;
};

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
