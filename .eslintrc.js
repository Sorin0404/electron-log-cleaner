module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'class-methods-use-this': 'off',
    'no-underscore-dangle': 'off',
    'max-len': ['error', { code: 100, ignoreComments: true }],
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: true,
      peerDependencies: true,
    }],
    'no-restricted-syntax': 'off', // Allow for...of loops
    'no-continue': 'off', // Allow continue statement
  },
  settings: {
    'import/core-modules': ['electron', 'electron-log/main'],
  },
};
