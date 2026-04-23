import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules',
      'dist',
      'build', // 🔽 これが今回の本丸
      'app/dist',
      '**/dist/**',
      '**/*.min.js',
    ],
  },
  {
    files: ['**/client/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: [
      '**/server/**/*.ts',
      'script/**/*.ts',
      'script/**/*.js',
      '*.config.js',
      '*.config.ts',
      'app/*.config.js',
      'app/*.config.ts',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      // バグ防止（必須）
      'no-undef': 'error',
      'no-irregular-whitespace': 'error',
      'no-case-declarations': 'error',
      'no-empty': 'warn',

      // 開発体験（実務向けバランス）
      'no-console': 'warn',
      'no-unused-vars': 'off', // TS側で管理

      // TypeScript用（重要）
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',

      // 自動修正系
      'prefer-const': 'warn',
    },
  },
];
