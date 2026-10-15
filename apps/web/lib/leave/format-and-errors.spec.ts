import { errorMessage, errorStatus, fieldErrors } from './errors';
import { STATUS_LABEL, STATUS_TONE, plural } from './format';

describe('status format', () => {
  it('uses the colours from the brief', () => {
    expect(STATUS_TONE).toEqual({
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      cancelled: 'neutral',
    });
    expect(STATUS_LABEL.cancelled).toBe('Cancelled');
  });

  it('pluralises', () => {
    expect(plural(1, 'day')).toBe('1 day');
    expect(plural(3, 'day')).toBe('3 days');
  });
});

describe('api errors', () => {
  const apiError = {
    message: 'No working days in this range',
    statusCode: 400,
    body: {
      details: [
        { field: 'endDate', message: 'No working days in this range' },
        { field: 'endDate', message: 'second message' },
        { field: 'reason', message: 'Please add a reason' },
      ],
    },
  };

  it('reads the message and status', () => {
    expect(errorMessage(apiError)).toBe('No working days in this range');
    expect(errorStatus(apiError)).toBe(400);
  });

  it('falls back for unknown errors', () => {
    expect(errorMessage(null)).toBe('Something went wrong');
    expect(errorMessage({ message: '' }, 'Try again')).toBe('Try again');
    expect(errorStatus('boom')).toBeUndefined();
  });

  it('keeps the first message per field', () => {
    expect(fieldErrors(apiError)).toEqual({
      endDate: 'No working days in this range',
      reason: 'Please add a reason',
    });
    expect(fieldErrors(new Error('plain'))).toEqual({});
  });
});
