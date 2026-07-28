/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  ignoreFiles: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/coverage/**'],
  rules: {
    // Mirror Sonar css:S8778 — all @import must come before other at-rules/style rules.
    // Ignore Tailwind v4 at-rules that may appear between build-time imports.
    'no-invalid-position-at-import-rule': [
      true,
      {
        ignoreAtRules: [
          'source',
          'theme',
          'plugin',
          'utility',
          'custom-variant',
          'variant',
          'config',
          'reference',
          'apply',
        ],
      },
    ],
    // Tailwind / design-system patterns
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'layer',
          'config',
          'theme',
          'custom-variant',
          'variant',
          'source',
          'plugin',
          'utility',
          'reference',
        ],
      },
    ],
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: ['theme', 'screen'],
      },
    ],
    'declaration-empty-line-before': null,
    'color-hex-length': 'short',
    // Allow intentional design tokens / utility composition
    'custom-property-pattern': null,
    'selector-class-pattern': null,
    'keyframes-name-pattern': null,
    'color-function-notation': null,
    'alpha-value-notation': null,
    'hue-degree-notation': null,
    'import-notation': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'no-descending-specificity': null,
  },
};
