const nextJest = require('next/jest');

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files
	dir: './'
});

// Add any custom config to be passed to Jest for integration tests
const customJestConfig = {
	// Add more setup options before each test is run
	setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],

	// if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
	moduleDirectories: ['node_modules', '<rootDir>/'],

	// Handle module aliases
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1'
	},

	// Test environment - use node for integration tests to have real fetch
	testEnvironment: 'jest-environment-node',

	// Test patterns - only integration tests
	testMatch: [
		'<rootDir>/src/**/__tests__/**/integration/**/*.{test,spec}.{js,jsx,ts,tsx}',
		'<rootDir>/src/__tests__/integration/**/*.{test,spec}.{js,jsx,ts,tsx}'
	],

	// Ignore patterns
	testPathIgnorePatterns: [
		'<rootDir>/node_modules/',
		'<rootDir>/src/__tests__/mocks/',
		'<rootDir>/src/__tests__/utils/',
		'<rootDir>/e2e/'
	],

	// Transform configuration
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
	},

	// Module file extensions
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

	// Setup files
	setupFiles: ['<rootDir>/jest.polyfills.js'],

	// Clear mocks between tests
	clearMocks: true,

	// Restore mocks after each test
	restoreMocks: true,

	// Verbose output
	verbose: true,

	// Transform ignore patterns
	transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|@radix-ui|lucide-react))'],

	// Timeout for integration tests
	testTimeout: 30000
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
