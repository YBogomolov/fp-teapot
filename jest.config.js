module.exports = {
  automock: false,
  cacheDirectory: './.cache/jest',
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  transform: {
    '.tsx?$': 'ts-jest'
  },
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node',
  ],
  coverageDirectory: '.cache/coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.spec.remote.ts',
    '!src/**/*.d.ts',
  ]
};
