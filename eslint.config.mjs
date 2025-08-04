import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import path from 'path';

export default [
  // ========================================
  // SHARED CONFIGURATION
  // ========================================
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,

  // Global ignores
  {
    ignores: [
      'coverage',
      '**/public',
      '**/dist',
      'pnpm-lock.yaml',
      'pnpm-workspace.yaml',
      '**/node_modules',
      '**/*.js',
      '**/*.mjs',
      '**/*.cjs',
    ],
  },

  // Shared language options
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },

  // ========================================
  // FRONTEND CONFIGURATION
  // ========================================
  {
    files: ['apps/frontend/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: [path.resolve('apps/frontend/tsconfig*.json')],
        tsconfigRootDir: path.resolve(),
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // React rules
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react-refresh/only-export-components': 'off',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },

  // ========================================
  // BACKEND CONFIGURATION
  // ========================================
  {
    files: ['apps/backend/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: [path.resolve('apps/backend/tsconfig.json')],
        tsconfigRootDir: path.resolve(),
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // TypeScript rules
      ...tseslint.configs.recommended[1].rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // ========================================
  // PACKAGES CONFIGURATION
  // ========================================
  {
    files: ['packages/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['./packages/*/tsconfig*.json'],
        tsconfigRootDir: path.resolve(),
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
