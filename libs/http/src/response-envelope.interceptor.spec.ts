import { CallHandler, ExecutionContext, StreamableFile } from '@nestjs/common';
import { of, firstValueFrom } from 'rxjs';
import { Readable } from 'stream';
import { ResponseEnvelopeInterceptor } from './response-envelope.interceptor';

describe('ResponseEnvelopeInterceptor', () => {
  const interceptor = new ResponseEnvelopeInterceptor();
  const context = {} as ExecutionContext;

  it('wraps JSON bodies in { data }', async () => {
    const next: CallHandler = { handle: () => of({ status: 'ok' }) };
    const result = await firstValueFrom(interceptor.intercept(context, next));
    expect(result).toEqual({ data: { status: 'ok' } });
  });

  it('does not double-wrap an existing { data } envelope', async () => {
    const next: CallHandler = { handle: () => of({ data: { id: 1 } }) };
    const result = await firstValueFrom(interceptor.intercept(context, next));
    expect(result).toEqual({ data: { id: 1 } });
  });

  it('passes StreamableFile through unchanged', async () => {
    const file = new StreamableFile(Readable.from(['x']));
    const next: CallHandler = { handle: () => of(file) };
    const result = await firstValueFrom(interceptor.intercept(context, next));
    expect(result).toBe(file);
  });
});
