// Setup file specifically for integration tests
import dotenv from 'dotenv';

// Load environment variables for testing
dotenv.config();

// Setup DOM globals for Node environment
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
	url: 'http://localhost',
	pretendToBeVisual: true,
	resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.DOMParser = dom.window.DOMParser;

// Mock Worker for Node.js environment
global.Worker = class MockWorker {
	constructor(scriptURL) {
		this.scriptURL = scriptURL;
		this.onmessage = null;
		this.onerror = null;
	}

	postMessage(data) {
		// For integration tests, we'll execute the worker function synchronously
		// Process the real data instead of mocking
		setTimeout(() => {
			try {
				if (this.onmessage) {
					// Import the actual restructureTKB function and process real data
					const { restructureTKB } = require('@/lib/ts/calendar');

					// Check if data is already processed (has data_subject property)
					if (data && data.data_subject) {
						// Data is already processed, just return it
						this.onmessage({ data: data });
					} else {
						// Process raw data
						const result = restructureTKB(data);
						this.onmessage({ data: result });
					}
				}
			} catch (error) {
				console.error('Worker error:', error);
				if (this.onerror) {
					this.onerror(error);
				}
			}
		}, 0);
	}

	terminate() {
		// Mock terminate
	}
};

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL = {
	createObjectURL: jest.fn(() => 'mock-object-url'),
	revokeObjectURL: jest.fn()
};

// Mock Blob
global.Blob = class MockBlob {
	constructor(parts, options) {
		this.parts = parts;
		this.options = options;
	}
};

// Mock Next.js router
jest.mock('next/router', () => ({
	useRouter() {
		return {
			route: '/',
			pathname: '/',
			query: {},
			asPath: '/',
			push: jest.fn(),
			pop: jest.fn(),
			reload: jest.fn(),
			back: jest.fn(),
			prefetch: jest.fn().mockResolvedValue(undefined),
			beforePopState: jest.fn(),
			events: {
				on: jest.fn(),
				off: jest.fn(),
				emit: jest.fn()
			},
			isFallback: false,
			isLocaleDomain: false,
			isReady: true,
			defaultLocale: 'en',
			domainLocales: [],
			isPreview: false
		};
	}
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
	useRouter() {
		return {
			push: jest.fn(),
			replace: jest.fn(),
			prefetch: jest.fn(),
			back: jest.fn(),
			forward: jest.fn(),
			refresh: jest.fn()
		};
	},
	useSearchParams() {
		return new URLSearchParams();
	},
	usePathname() {
		return '/';
	}
}));

// Mock localStorage
const localStorageMock = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
	getItem: jest.fn(),
	setItem: jest.fn(),
	removeItem: jest.fn(),
	clear: jest.fn()
};
global.sessionStorage = sessionStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // deprecated
		removeListener: jest.fn(), // deprecated
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn()
	}))
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
	constructor() {}
	observe() {
		return null;
	}
	disconnect() {
		return null;
	}
	unobserve() {
		return null;
	}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
	constructor() {}
	observe() {
		return null;
	}
	disconnect() {
		return null;
	}
	unobserve() {
		return null;
	}
};

// Use real fetch for integration tests
// Don't mock fetch - let it use the real implementation

// Mock console methods to reduce noise in tests
const originalError = console.error;
beforeAll(() => {
	console.error = (...args) => {
		if (
			typeof args[0] === 'string' &&
			args[0].includes('Warning: ReactDOM.render is no longer supported')
		) {
			return;
		}
		originalError.call(console, ...args);
	};
});

afterAll(() => {
	console.error = originalError;
});

// Clean up after each test
afterEach(() => {
	jest.clearAllMocks();
	localStorageMock.clear();
	sessionStorageMock.clear();
});
