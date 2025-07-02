// jest.polyfills.js
/**
 * @note The block below contains polyfills for Node.js globals
 * required for Jest to function when running JSDOM tests.
 * These HAVE to be require's and HAVE to be in this exact
 * order, since "undici" depends on the "TextEncoder" global API.
 *
 * Consider migrating to a more modern test runner if
 * you don't want to deal with this.
 */

const { TextDecoder, TextEncoder } = require('util');

Object.defineProperties(globalThis, {
	TextDecoder: { value: TextDecoder },
	TextEncoder: { value: TextEncoder }
});

// Mock fetch and related APIs for testing
if (typeof globalThis.fetch === 'undefined') {
	globalThis.fetch = jest.fn();
}

if (typeof globalThis.Headers === 'undefined') {
	globalThis.Headers = class Headers {
		constructor() {}
		get() {
			return null;
		}
		set() {}
		append() {}
		delete() {}
		has() {
			return false;
		}
		keys() {
			return [][Symbol.iterator]();
		}
		values() {
			return [][Symbol.iterator]();
		}
		entries() {
			return [][Symbol.iterator]();
		}
		forEach() {}
	};
}

if (typeof globalThis.FormData === 'undefined') {
	globalThis.FormData = class FormData {
		constructor() {}
		append() {}
		delete() {}
		get() {
			return null;
		}
		getAll() {
			return [];
		}
		has() {
			return false;
		}
		set() {}
		keys() {
			return [][Symbol.iterator]();
		}
		values() {
			return [][Symbol.iterator]();
		}
		entries() {
			return [][Symbol.iterator]();
		}
		forEach() {}
	};
}

if (typeof globalThis.Request === 'undefined') {
	globalThis.Request = class Request {
		constructor(url, options = {}) {
			this.url = url;
			this.method = options.method || 'GET';
			this.headers = new globalThis.Headers(options.headers);
		}
	};
}

if (typeof globalThis.Response === 'undefined') {
	globalThis.Response = class Response {
		constructor(body, options = {}) {
			this.body = body;
			this.status = options.status || 200;
			this.statusText = options.statusText || 'OK';
			this.headers = new globalThis.Headers(options.headers);
			this.ok = this.status >= 200 && this.status < 300;
		}

		async json() {
			return JSON.parse(this.body);
		}

		async text() {
			return this.body;
		}
	};
}
