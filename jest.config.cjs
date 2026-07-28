const path = require('node:path');

/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  // Always the monorepo root (config lives here), even when jest cwd is an app package.
  rootDir: path.join(__dirname),
  testRegex: String.raw`.*\.spec\.tsx?$`,
  transform: {
    [String.raw`^.+\.(t|j)sx?$`]: [
      'ts-jest',
      {
        tsconfig: {
          module: 'CommonJS',
          moduleResolution: 'Node',
          emitDecoratorMetadata: true,
          experimentalDecorators: true,
          strictPropertyInitialization: false,
          esModuleInterop: true,
          jsx: 'react-jsx',
          paths: {
            '@shared/env': ['libs/env/src/index.ts'],
            '@shared/env/*': ['libs/env/src/*/index.ts'],
            '@shared/http': ['libs/http/src/index.ts'],
            '@shared/http/*': ['libs/http/src/*/index.ts'],
            '@shared/types': ['libs/shared-types/src/index.ts'],
            '@shared/ui': ['libs/ui/src/index.ts'],
            '@shared/ui/*': ['libs/ui/src/*'],
          },
          baseUrl: '.',
        },
      },
    ],
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@shared/env$': '<rootDir>/libs/env/src/index.ts',
    '^@shared/env/(.*)$': '<rootDir>/libs/env/src/$1/index.ts',
    '^@shared/http$': '<rootDir>/libs/http/src/index.ts',
    '^@shared/http/(.*)$': '<rootDir>/libs/http/src/$1/index.ts',
    '^@shared/types$': '<rootDir>/libs/shared-types/src/index.ts',
    '^@shared/ui$': '<rootDir>/libs/ui/src/index.ts',
    '^@shared/ui/(.*)$': '<rootDir>/libs/ui/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/.next/'],
  collectCoverageFrom: [
    'apps/api-gateway/src/common/proxy-hop.ts',
    'apps/api-gateway/src/modules/auth/auth.service.ts',
    'apps/api-gateway/src/modules/auth/dto/auth.dto.ts',
    'apps/api-gateway/src/modules/auth/strategies/jwt.strategy.ts',
    'apps/api-gateway/src/modules/users/users.service.ts',
    'apps/api-gateway/src/modules/health/health.controller.ts',
    'apps/api/src/modules/auth/strategies/jwt.strategy.ts',
    'apps/api/src/modules/health/health.controller.ts',
    'apps/api/src/modules/health/ready.controller.ts',
    'apps/web/lib/api-base-url.ts',
    'libs/http/src/**/*.ts',
    'libs/api-client/src/**/*.ts',
    'libs/shared-types/src/index.ts',
    'libs/ui/src/cn.ts',
    'libs/ui/src/components/status-message.tsx',
    'libs/ui/src/components/button.tsx',
    'libs/ui/src/components/spinner.tsx',
    '!**/*.spec.ts',
    '!**/*.spec.tsx',
    '!**/index.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 85,
      statements: 85,
    },
  },
};
