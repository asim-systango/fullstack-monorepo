import base from './libs/config/eslint/base.js';

/**
 * Root ESLint config for Husky / lint-staged (includes SonarJS).
 * Per-package turbo lint still uses package eslint configs (incl. Next rules).
 */
/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/node_modules/**',
      '**/data/**',
      '**/coverage/**',
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.cjs',
      '**/commitlint.config.*',
      '**/jest.config.*',
    ],
  },
  ...base,
];
