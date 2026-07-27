import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.cjs',
      '**/commitlint.config.*',
      '**/jest.config.*',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  sonarjs.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/no-duplicate-string': ['error', { threshold: 5 }],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-inverted-boolean-check': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/no-nested-template-literals': 'error',
      // Seeds + timing-dummy bcrypt hashes are intentional, not real secrets
      'sonarjs/no-hardcoded-passwords': 'off',
    },
  },
];
