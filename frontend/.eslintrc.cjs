module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['react-hooks', 'react-refresh', 'prettier'],
  extends: ['airbnb', 'airbnb/hooks', 'plugin:prettier/recommended'],
  rules: {
    'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'prettier/prettier': 'error',
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: true, optionalDependencies: true, peerDependencies: true },
    ],
  },
  ignorePatterns: ['dist', 'vite.config.js'],
};
