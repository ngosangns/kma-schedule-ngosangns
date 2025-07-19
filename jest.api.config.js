const nextJest = require('next/jest');

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files
	dir: './'
});

// Add any custom config to be passed to Jest
const customJestConfig = {
	// Add more setup options before each test is run
	setupFilesAfterEnv: ['<rootDir>/jest.api.setup.js'],
	// if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
	moduleDirectories: ['node_modules', '<rootDir>/'],
	testEnvironment: 'node',
	moduleNameMapping: {
		'^@/(.*)$': '<rootDir>/src/$1'
	},
	testMatch: [
		'<rootDir>/src/__tests__/api/**/*.test.{js,jsx,ts,tsx}'
	],
	collectCoverageFrom: [
		'src/app/api/**/*.{js,jsx,ts,tsx}',
		'!src/app/api/**/*.d.ts'
	]
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
