import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['*.js'],
    languageOptions: {
      globals: {
        // ...globals.serviceworker,
        ...globals.node,
      },
    },
  },
  {
    files: ['src/**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    languageOptions: {
      globals: {
        // ...globals.serviceworker,
        ...globals.browser,
      },
    },
    rules: {
      "@typescript-eslint/no-namespace": "off", // Disable a rule for test files
    },
  },
  prettier,

];
