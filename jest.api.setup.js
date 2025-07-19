// API test setup - minimal setup for Node.js environment

// Mock console methods to reduce noise in tests
global.console = {
	...console,
	// Uncomment to ignore specific log levels
	// log: jest.fn(),
	// debug: jest.fn(),
	// info: jest.fn(),
	// warn: jest.fn(),
	error: jest.fn()
};

// Mock fetch if not available in Node.js environment
if (!global.fetch) {
	global.fetch = jest.fn();
}

// Setup environment variables for tests
process.env.NODE_ENV = 'test';
