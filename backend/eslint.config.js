import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import tseslint from 'typescript-eslint';

const FEATURES = ['auth', 'shop', 'branch', 'game', 'price-plan', 'menu', 'promotion'];

// Feature chỉ được import feature khác qua index.ts (BE-ARCHITECTURE.md mục 5)
const featureZones = FEATURES.flatMap((target) =>
  FEATURES.filter((from) => from !== target).map((from) => ({
    target: `./src/features/${target}`,
    from: `./src/features/${from}`,
    except: ['./index.ts'],
    message: `Chỉ import feature "${from}" qua '@/features/${from}' (index.ts)`,
  })),
);

// shared, core, config không bao giờ import features
const layerZones = ['shared', 'core', 'config'].map((layer) => ({
  target: `./src/${layer}`,
  from: './src/features',
  message: `${layer}/ không được import features/`,
}));

export default defineConfig(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'src/generated/**'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    plugins: { import: importPlugin },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.json' } },
    },
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      'import/no-restricted-paths': ['error', { zones: [...featureZones, ...layerZones] }],
    },
  },
  prettier,
);
