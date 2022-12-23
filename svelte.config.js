// import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	adapter: adapter({
		fallback: '200.html'
	}),
	prerender: { entries: [], enable: false },
	preprocess: vitePreprocess()
};

export default config;
