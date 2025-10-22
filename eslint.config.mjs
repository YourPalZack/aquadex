// Flat ESLint config for ESLint v9+ compatible with Next.js 15/16
// See: https://nextjs.org/docs/app/building-your-application/configuring/eslint

import next from 'eslint-config-next/flat';

export default [
  // Next.js recommended config (includes React, JSX, TS support)
  ...next({
    // Enable core web vitals ruleset
    extends: ['next/core-web-vitals', 'next/typescript'],
  }),
  // Ignores
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'dist/**',
      'build/**',
      '**/*.css',
    ],
  },
];
