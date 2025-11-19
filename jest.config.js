/**
 * Jest Configuration
 * Tests pour le Quebec Electrical System
 */

export default {
  // Use Node test environment
  testEnvironment: 'node',

  // Transform ES modules
  transform: {},

  // File extensions to consider
  moduleFileExtensions: ['js', 'mjs', 'json'],

  // Test match patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/__tests__/**/*.js',
  ],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/.git/',
  ],

  // Coverage thresholds
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Indicates whether each individual test should be reported
  notify: false,

  // Maximum workers
  maxWorkers: '50%',

  // Test timeout
  testTimeout: 10000,
};
