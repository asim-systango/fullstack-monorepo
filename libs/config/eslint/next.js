import base from './base.js';
import nextPlugin from 'eslint-config-next';

/** @type {import('eslint').Linter.Config[]} */
export default [...base, ...nextPlugin];
