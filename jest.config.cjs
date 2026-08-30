/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  // MSW v2: resolve node (CJS) builds instead of browser ESM under jsdom.
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx|mjs|cjs)$': 'babel-jest',
  },
  // MSW v2 ships some pure-ESM deps; let babel transform those too.
  transformIgnorePatterns: [
    '/node_modules/(?!(msw|@mswjs|@bundled-es-modules|@open-draft|until-async|strict-event-emitter|rettime|outvariant|headers-polyfill|is-node-process)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.module\\.css$': 'identity-obj-proxy',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(png|jpe?g|gif|svg|webp|avif|woff2?|ttf|eot)$': '<rootDir>/test/mocks/fileMock.cjs',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['<rootDir>/src/**/*.(test|spec).(ts|tsx)'],
}
