import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter.catch', () => {
  const filter = new AllExceptionsFilter();
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  function hostWithResponse() {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({}),
      }),
    } as unknown as ArgumentsHost;
    return { host, status, json };
  }

  function withNodeEnv(value: string, run: () => void) {
    const previous = process.env.NODE_ENV;
    Object.assign(process.env, { NODE_ENV: value });

    try {
      run();
    } finally {
      Object.assign(process.env, { NODE_ENV: previous });
    }
  }

  it('serializes HttpException responses', () => {
    const { host, status, json } = hostWithResponse();
    filter.catch(
      new HttpException({ message: 'nope', error: 'Forbidden' }, HttpStatus.FORBIDDEN),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden',
        message: 'nope',
      }),
    );
  });

  it('serializes string HttpException bodies', () => {
    const { host, json } = hostWithResponse();
    filter.catch(new HttpException('plain', HttpStatus.BAD_REQUEST), host);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'plain',
      }),
    );
  });

  it('preserves field details from BadRequestException', () => {
    const { host, json } = hostWithResponse();
    filter.catch(
      new BadRequestException({
        statusCode: 400,
        error: 'Bad Request',
        message: ['email must be an email'],
        details: [{ field: 'email', message: 'email must be an email' }],
      }),
      host,
    );
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        details: [{ field: 'email', message: 'email must be an email' }],
      }),
    );
  });

  it('hides unexpected Error messages in production', () => {
    withNodeEnv('production', () => {
      const { host, status, json } = hostWithResponse();

      expect(() => filter.catch(new Error('secret stack detail'), host)).not.toThrow();
      expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unexpected error',
        }),
      );
    });
  });

  it('exposes Error messages outside production', () => {
    withNodeEnv('test', () => {
      const { host, json } = hostWithResponse();

      expect(() => filter.catch(new Error('visible detail'), host)).not.toThrow();
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'visible detail',
        }),
      );
    });
  });
});
