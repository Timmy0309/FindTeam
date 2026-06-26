module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  verbose: true,
  reporters: [
    'default',
    ['<rootDir>/tests/reporters/fuzzReporter.js', {}],
  ],
};
