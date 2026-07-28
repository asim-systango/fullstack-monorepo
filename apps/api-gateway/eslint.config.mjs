import eslintConfig from '@repo/config/eslint/base';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...eslintConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
];
