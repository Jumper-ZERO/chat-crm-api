// @ts-check
import eslint from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      import: pluginImport,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prettier/prettier': 'off',

      // Import ordering optimizado para NestJS
      'import/order': [
        'error',
        {
          groups: [
            'builtin',           // Node.js built-ins (fs, path, etc.)
            'external',          // Third-party packages
            'internal',          // Internal modules
            ['parent', 'sibling', 'index'], // Relative imports
          ],
          'newlines-between': 'ignore',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          pathGroups: [
            // NestJS core modules first
            {
              pattern: '@nestjs/**',
              group: 'external',
              position: 'before',
            },
            // Configuration files
            {
              pattern: './config/**',
              group: 'internal',
              position: 'before',
            },
            // Controllers
            {
              pattern: './**/*.controller',
              group: 'internal',
              position: 'after',
            },
            // Services
            {
              pattern: './**/*.service',
              group: 'internal',
              position: 'after',
            },
            // Entities/DTOs
            {
              pattern: './**/*.{entity,dto}',
              group: 'internal',
              position: 'after',
            },
            // Utils/Validators
            {
              pattern: './utils/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
    },
  },
);