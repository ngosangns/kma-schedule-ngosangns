const nextJest = require('next/jest');

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files
	dir: './'
});

// Add any custom config to be passed to Jest
const customJestConfig = {
	// Add more setup options before each test is run
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

	// if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
	moduleDirectories: ['node_modules', '<rootDir>/'],

	// Handle module aliases
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1'
	},

	// Test environment
	testEnvironment: 'jest-environment-jsdom',

	// Coverage configuration
	collectCoverageFrom: [
		'src/**/*.{js,jsx,ts,tsx}',
		'!src/**/*.d.ts',
		'!src/pages/_app.tsx',
		'!src/pages/_document.tsx',
		'!src/pages/api/**',
		'!src/**/*.stories.{js,jsx,ts,tsx}',
		'!src/**/*.test.{js,jsx,ts,tsx}',
		'!src/**/*.spec.{js,jsx,ts,tsx}',
		'!src/**/index.{js,jsx,ts,tsx}'
	],

	// Coverage thresholds
	coverageThreshold: {
		global: {
			branches: 70,
			functions: 70,
			lines: 70,
			statements: 70
		}
	},

	// Test patterns
	testMatch: [
		'<rootDir>/src/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}',
		'<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
		'<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}'
	],

	// Ignore patterns
	testPathIgnorePatterns: [
		'<rootDir>/node_modules/',
		'<rootDir>/src/__tests__/mocks/',
		'<rootDir>/src/__tests__/utils/'
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
	transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|@radix-ui|lucide-react))']
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
