import base from '@shared/config/eslint/base';
import jsxA11y from 'eslint-plugin-jsx-a11y';

/**
 * Root ESLint config for Husky / lint-staged / `pnpm lint:sonar` (includes SonarJS).
 * Forced via lint-staged `--config eslint.config.mjs` so package-local configs
 * cannot drop SonarJS on commit.
 *
 * - `projectService` → typed Sonar rules (e.g. prefer-read-only-props)
 * - `jsx-a11y/prefer-tag-over-role` → SonarLint S6819 (e.g. `<output>` over role="status")
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
      '**/*.spec.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.cjs',
      '**/commitlint.config.*',
      '**/jest.config.*',
    ],
  },
  ...base,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          // Root/config JS not covered by package tsconfigs
          allowDefaultProject: [
            'eslint.config.mjs',
            'libs/config/eslint/*.js',
          ],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { 'jsx-a11y': jsxA11y },
    rules: {
      // Matches SonarLint typescript:S6819 (prefer native tag over ARIA role)
      'jsx-a11y/prefer-tag-over-role': 'error',
      // Matches SonarLint / IDE: no mouse/keyboard listeners on non-interactive nodes
      'jsx-a11y/no-static-element-interactions': 'error',
    },
  },
];
