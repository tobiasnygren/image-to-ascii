import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['node_modules/', 'coverage/', 'dist/']
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        // Node.js globals
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        // Web API globals (used in tests)
        FormData: 'readonly',
        File: 'readonly',
        Blob: 'readonly'
      }
    },
    rules: {
      // Possible errors
      'no-console': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // Best practices
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',

      // ES6+
      'arrow-body-style': ['error', 'as-needed'],
      'prefer-arrow-callback': 'error'
    }
  },
  prettier
];
