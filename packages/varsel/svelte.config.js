import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/package').Config} */
const config = {
	preprocess: vitePreprocess(),
	package: {
		source: 'src/lib',
		dir: 'dist',
		emitTypes: true
	}
};

export default config;
