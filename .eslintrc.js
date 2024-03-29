module.exports = {
   env: {
      browser: true,
      es2021: true,
      node: true,
   },
   extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
   ],
   overrides: [],
   parser: '@typescript-eslint/parser',
   parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
   },
   plugins: ['react', '@typescript-eslint', 'simple-import-sort', 'no-relative-import-paths'],
   rules: {
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-relative-import-paths/no-relative-import-paths': [
         'warn',
         {
            allowSameFolder: true,
            prefix: '@',
            rootDir: 'src',
         },
      ],
   },
}
