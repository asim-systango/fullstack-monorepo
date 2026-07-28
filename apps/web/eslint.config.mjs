import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import base from '@shared/config/eslint/base';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

/**
 * Next core-web-vitals + shared base (TypeScript + SonarJS).
 * Pre-commit / lint:sonar use the root eslint.config.mjs (also includes SonarJS).
 */
/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: ['eslint.config.mjs', '.next/**', 'next-env.d.ts'],
  },
  ...base,
  ...compat.extends('next/core-web-vitals'),
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];

export default config;
