/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,

  env: {
    node: true,
    es2022: true,
  },

  parser: '@typescript-eslint/parser',

  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },

  plugins: ['@typescript-eslint', 'import'],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],

  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
      },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',

    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',

    'no-console': [
      'warn',
      {
        allow: ['warn', 'error'],
      },
    ],

    eqeqeq: ['error', 'always'],
    curly: ['error', 'all'],
  },

  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
};
