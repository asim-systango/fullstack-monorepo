import { BadRequestException, ValidationError } from '@nestjs/common';
import {
  flattenValidationErrors,
  validationExceptionFactory,
} from './all-exceptions.filter';

describe('validationExceptionFactory', () => {
  it('maps nested ValidationError properties to details.field', () => {
    const errors: ValidationError[] = [
      {
        property: 'email',
        constraints: { isEmail: 'email must be an email' },
        children: [],
      },
      {
        property: 'profile',
        children: [
          {
            property: 'name',
            constraints: { isNotEmpty: 'name should not be empty' },
            children: [],
          },
        ],
      },
    ];

    expect(flattenValidationErrors(errors)).toEqual([
      { field: 'email', message: 'email must be an email' },
      { field: 'profile.name', message: 'name should not be empty' },
    ]);

    const exception = validationExceptionFactory(errors);
    expect(exception).toBeInstanceOf(BadRequestException);
    const body = exception.getResponse() as {
      details: Array<{ field: string; message: string }>;
    };
    expect(body.details[0]?.field).toBe('email');
  });
});
