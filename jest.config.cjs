/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: {
          module: 'CommonJS',
          moduleResolution: 'Node',
          emitDecoratorMetadata: true,
          experimentalDecorators: true,
          strictPropertyInitialization: false,
          esModuleInterop: true,
        },
      },
    ],
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@shared/env$': '<rootDir>/libs/env/src/index.ts',
    '^@shared/http$': '<rootDir>/libs/http/src/index.ts',
    '^@shared/types$': '<rootDir>/libs/shared-types/src/index.ts',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/.next/'],
};
