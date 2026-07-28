import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter.catch', () => {
  const filter = new AllExceptionsFilter();

  function hostWithResponse() {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
      }),
    } as unknown as ArgumentsHost;
    return { host, status, json };
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
    const prev = process.env.NODE_ENV;
    Object.assign(process.env, { NODE_ENV: 'production' });
    const { host, status, json } = hostWithResponse();

    try {
      filter.catch(new Error('secret stack detail'), host);
      expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unexpected error',
        }),
      );
    } finally {
      Object.assign(process.env, { NODE_ENV: prev });
    }
  });

  it('exposes Error messages outside production', () => {
    const prev = process.env.NODE_ENV;
    Object.assign(process.env, { NODE_ENV: 'test' });
    const { host, json } = hostWithResponse();

    try {
      filter.catch(new Error('visible detail'), host);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'visible detail',
        }),
      );
    } finally {
      Object.assign(process.env, { NODE_ENV: prev });
    }
  });
});
