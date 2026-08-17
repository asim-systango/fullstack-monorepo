import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { OpenAPIObject } from '@nestjs/swagger';
import { mergeOpenApiDocuments, setupSwagger } from './setup-swagger';

jest.mock('@nestjs/swagger', () => {
  const build = jest.fn().mockReturnValue({ openapi: '3.0.0' });
  const addCookieAuth = jest.fn().mockReturnThis();
  const addBearerAuth = jest.fn().mockReturnThis();
  const setTitle = jest.fn().mockReturnThis();
  const setDescription = jest.fn().mockReturnThis();
  const setVersion = jest.fn().mockReturnThis();

  return {
    DocumentBuilder: jest.fn().mockImplementation(() => ({
      setTitle,
      setDescription,
      setVersion,
      addCookieAuth,
      addBearerAuth,
      build,
    })),
    SwaggerModule: {
      createDocument: jest.fn().mockReturnValue({
        openapi: '3.0.0',
        info: { title: 'Base', version: '1.0' },
        paths: { '/auth/login': { post: {} } },
        tags: [{ name: 'auth' }],
        components: {
          schemas: { User: {} },
          securitySchemes: { cookie: {} },
        },
      }),
      setup: jest.fn(),
    },
  };
});

const baseDoc = {
  openapi: '3.0.0',
  info: { title: 'Base', version: '1.0' },
  paths: {
    '/auth/login': { post: {} },
    '/internal/x': { get: {} },
  },
  tags: [{ name: 'auth' }],
  components: {
    schemas: { User: { type: 'object' } },
    securitySchemes: { cookie: {} },
  },
} as unknown as OpenAPIObject;

const remoteDoc = {
  openapi: '3.0.0',
  info: { title: 'Remote', version: '1.0' },
  paths: {
    '/books': { get: {} },
    '/auth/login': { post: { summary: 'remote' } },
    '/internal/secret': { get: {} },
    '/internal': { get: {} },
  },
  tags: [{ name: 'auth' }, { name: 'books' }],
  components: {
    schemas: { Book: {}, User: { type: 'string' } },
    securitySchemes: { bearer: {} },
  },
} as unknown as OpenAPIObject;

describe('mergeOpenApiDocuments', () => {
  it('keeps gateway paths, drops excluded prefixes, and merges tags/schemas', () => {
    const merged = mergeOpenApiDocuments(baseDoc, remoteDoc);

    expect(merged.paths['/books']).toEqual({ get: {} });
    expect(merged.paths['/auth/login']).toEqual({ post: {} });
    expect(merged.paths['/internal/secret']).toBeUndefined();
    expect(merged.paths['/internal']).toBeUndefined();
    expect(merged.tags?.map((t) => t.name)).toEqual(['auth', 'books']);
    expect(merged.components?.schemas).toMatchObject({
      Book: {},
      User: { type: 'object' },
    });
  });

  it('normalizes prefixes that end with a slash', () => {
    const merged = mergeOpenApiDocuments(baseDoc, remoteDoc, {
      excludePathPrefixes: ['/internal/'],
    });
    expect(merged.paths['/internal/secret']).toBeUndefined();
    expect(merged.paths['/books']).toBeDefined();
  });

  it('handles missing remote paths and tags', () => {
    const merged = mergeOpenApiDocuments(
      { ...baseDoc, tags: undefined, components: undefined } as OpenAPIObject,
      { ...remoteDoc, paths: undefined, tags: undefined, components: undefined } as OpenAPIObject,
      {},
    );
    expect(merged.paths['/auth/login']).toBeDefined();
  });
});

describe('setupSwagger', () => {
  const app = { getHttpAdapter: jest.fn() } as never;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('no-ops when disabled', async () => {
    await setupSwagger(app, { title: 'Test', description: 'desc', auth: 'bearer' }, false);
    expect(SwaggerModule.setup).not.toHaveBeenCalled();
  });

  it('mounts cookie auth docs', async () => {
    await setupSwagger(
      app,
      {
        title: 'Gateway',
        description: 'BFF',
        auth: 'cookie',
        cookieName: 'access_token',
      },
      true,
    );

    expect(DocumentBuilder).toHaveBeenCalled();
    expect(SwaggerModule.createDocument).toHaveBeenCalled();
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'docs',
      app,
      expect.objectContaining({ paths: expect.any(Object) }),
      expect.objectContaining({
        swaggerOptions: expect.objectContaining({ persistAuthorization: true }),
      }),
    );
  });

  it('mounts bearer auth docs', async () => {
    await setupSwagger(
      app,
      { title: 'API', description: 'Domain', auth: 'bearer', path: 'api-docs' },
      true,
    );

    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api-docs',
      app,
      expect.any(Object),
      expect.any(Object),
    );
  });

  it('adds cookie and bearer auth together', async () => {
    await setupSwagger(
      app,
      { title: 'Both', description: 'desc', auth: 'cookie-and-bearer' },
      true,
    );
    expect(SwaggerModule.setup).toHaveBeenCalled();
  });

  it('merges remote OpenAPI when fetch succeeds', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => remoteDoc,
    }) as unknown as typeof fetch;

    await setupSwagger(
      app,
      {
        title: 'Gateway',
        description: 'BFF',
        auth: 'cookie',
        mergeOpenApiFrom: 'http://localhost:3002/docs-json',
        mergeRetries: 1,
        mergeRetryDelayMs: 1,
      },
      true,
    );

    expect(global.fetch).toHaveBeenCalled();
    expect(SwaggerModule.setup).toHaveBeenCalled();
  });

  it('retries then continues when remote docs fail', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValueOnce({ ok: false, status: 503 }) as unknown as typeof fetch;

    await setupSwagger(
      app,
      {
        title: 'Gateway',
        description: 'BFF',
        auth: 'bearer',
        mergeOpenApiFrom: 'http://localhost:3002/docs-json',
        mergeRetries: 2,
        mergeRetryDelayMs: 1,
      },
      true,
    );

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(SwaggerModule.setup).toHaveBeenCalled();
  });

  it('skips merge when retries is zero', async () => {
    global.fetch = jest.fn() as unknown as typeof fetch;

    await setupSwagger(
      app,
      {
        title: 'Gateway',
        description: 'BFF',
        auth: 'bearer',
        mergeOpenApiFrom: 'http://localhost:3002/docs-json',
        mergeRetries: 0,
      },
      true,
    );

    expect(global.fetch).not.toHaveBeenCalled();
    expect(SwaggerModule.setup).toHaveBeenCalled();
  });

  it('warns with a non-Error rejection on the last attempt', async () => {
    global.fetch = jest.fn().mockRejectedValue('boom') as unknown as typeof fetch;

    await setupSwagger(
      app,
      {
        title: 'Gateway',
        description: 'BFF',
        auth: 'bearer',
        mergeOpenApiFrom: 'http://localhost:3002/docs-json',
        mergeRetries: 1,
      },
      true,
    );

    expect(SwaggerModule.setup).toHaveBeenCalled();
  });
});
