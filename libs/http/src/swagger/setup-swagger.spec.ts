import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { setupSwagger } from './setup-swagger';

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
      createDocument: jest.fn().mockReturnValue({ paths: {} }),
      setup: jest.fn(),
    },
  };
});

describe('setupSwagger', () => {
  const app = { getHttpAdapter: jest.fn() } as never;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('no-ops when disabled', () => {
    setupSwagger(app, { title: 'Test', description: 'desc', auth: 'bearer' }, false);
    expect(SwaggerModule.setup).not.toHaveBeenCalled();
  });

  it('mounts cookie auth docs', () => {
    setupSwagger(
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
      { paths: {} },
      expect.objectContaining({
        swaggerOptions: expect.objectContaining({ persistAuthorization: true }),
      }),
    );
  });

  it('mounts bearer auth docs', () => {
    setupSwagger(
      app,
      { title: 'API', description: 'Domain', auth: 'bearer', path: 'api-docs' },
      true,
    );

    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api-docs',
      app,
      { paths: {} },
      expect.any(Object),
    );
  });
});
