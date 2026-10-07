import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Feature chỉ được import qua index.ts: '@/features/game', không '@/features/game/hooks/...'
const featureDeepImport = {
  group: ['@/features/*/*'],
  message: "Chỉ import feature qua index.ts, ví dụ '@/features/game'.",
}

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'no-restricted-imports': ['error', { patterns: [featureDeepImport] }],
    },
  },
  {
    // shared/ không bao giờ import features/
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features', '@/features/*', '**/features/**'],
              message: 'shared/ không được import features/.',
            },
          ],
        },
      ],
    },
  },
  prettier,
])
