import type { INestApplication } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';

export type SwaggerAuthMode = 'cookie' | 'bearer' | 'cookie-and-bearer';

export type SetupSwaggerOptions = {
  title: string;
  description: string;
  version?: string;
  /** Mount path (default `docs` → `/docs`). */
  path?: string;
  auth: SwaggerAuthMode;
  /** Cookie name when `auth` includes cookie (default `access_token`). */
  cookieName?: string;
  /**
   * Fetch and merge another OpenAPI doc (e.g. domain API `/docs-json`)
   * into this UI. Paths under `excludeMergedPathPrefixes` are skipped.
   */
  mergeOpenApiFrom?: string;
  /** Default `['/internal']` — hide service-to-service routes from public docs. */
  excludeMergedPathPrefixes?: string[];
  /** Retries when upstream docs are not ready yet (default 8 × 500ms). */
  mergeRetries?: number;
  mergeRetryDelayMs?: number;
};

type OpenApiPathItem = Record<string, unknown>;

const logger = new Logger('Swagger');

function shouldExcludePath(path: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => {
    const normalized = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
    return path === normalized || path.startsWith(`${normalized}/`);
  });
}

/** Deep-merge OpenAPI documents for a unified Swagger UI. */
export function mergeOpenApiDocuments(
  base: OpenAPIObject,
  remote: OpenAPIObject,
  options: { excludePathPrefixes?: string[] } = {},
): OpenAPIObject {
  const exclude = options.excludePathPrefixes ?? ['/internal'];
  const mergedPaths: Record<string, OpenApiPathItem> = {
    ...(base.paths as Record<string, OpenApiPathItem>),
  };

  for (const [path, item] of Object.entries(remote.paths ?? {})) {
    if (shouldExcludePath(path, exclude)) continue;
    // Gateway-owned paths win if both define the same route.
    if (mergedPaths[path]) continue;
    mergedPaths[path] = item as OpenApiPathItem;
  }

  const baseSchemas = base.components?.schemas ?? {};
  const remoteSchemas = remote.components?.schemas ?? {};

  const tagNames = new Set((base.tags ?? []).map((t) => t.name));
  const mergedTags = [...(base.tags ?? [])];
  for (const tag of remote.tags ?? []) {
    if (!tagNames.has(tag.name)) {
      tagNames.add(tag.name);
      mergedTags.push(tag);
    }
  }

  return {
    ...base,
    paths: mergedPaths,
    tags: mergedTags,
    components: {
      ...base.components,
      ...remote.components,
      schemas: {
        ...remoteSchemas,
        ...baseSchemas,
      },
      securitySchemes: {
        ...remote.components?.securitySchemes,
        ...base.components?.securitySchemes,
      },
    },
  };
}

async function fetchOpenApiJson(
  url: string,
  retries: number,
  delayMs: number,
): Promise<OpenAPIObject | null> {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(2_000),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return (await res.json()) as OpenAPIObject;
    } catch (err) {
      if (attempt === retries) {
        logger.warn(
          `Could not merge OpenAPI from ${url} after ${retries} attempts: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
        return null;
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return null;
}

/**
 * OpenAPI UI for local/dev Nest apps. Skipped when `enabled` is false
 * (typically production).
 *
 * On the gateway, pass `mergeOpenApiFrom` so auth + domain routes appear in one `/docs`.
 */
export async function setupSwagger(
  app: INestApplication,
  options: SetupSwaggerOptions,
  enabled = process.env.NODE_ENV !== 'production',
): Promise<void> {
  if (!enabled) return;

  const builder = new DocumentBuilder()
    .setTitle(options.title)
    .setDescription(options.description)
    .setVersion(options.version ?? '1.0');

  if (options.auth === 'cookie' || options.auth === 'cookie-and-bearer') {
    builder.addCookieAuth(options.cookieName ?? 'access_token');
  }
  if (options.auth === 'bearer' || options.auth === 'cookie-and-bearer') {
    builder.addBearerAuth();
  }

  let document = SwaggerModule.createDocument(app, builder.build());

  if (options.mergeOpenApiFrom) {
    const remote = await fetchOpenApiJson(
      options.mergeOpenApiFrom,
      options.mergeRetries ?? 8,
      options.mergeRetryDelayMs ?? 500,
    );
    if (remote) {
      document = mergeOpenApiDocuments(document, remote, {
        excludePathPrefixes: options.excludeMergedPathPrefixes ?? ['/internal'],
      });
      logger.log(`Merged OpenAPI from ${options.mergeOpenApiFrom}`);
    }
  }

  SwaggerModule.setup(options.path ?? 'docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
