import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server with default handlers
export const server = setupServer(...handlers);

// Establish API mocking before all tests
global.beforeAll(() => {
	server.listen({
		onUnhandledRequest: 'warn'
	});
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
global.afterEach(() => {
	server.resetHandlers();
});

// Clean up after the tests are finished
global.afterAll(() => {
	server.close();
});
