const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // if you have a setup file
  testEnvironment: 'jest-environment-node', // or 'jsdom' for frontend tests
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured by next/jest)
    // Example: '@/components/(.*)': '<rootDir>/src/components/$1',
  },
  preset: 'ts-jest', // Use ts-jest preset
  clearMocks: true, // Automatically clear mock calls, instances, contexts and results before every test
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig); 