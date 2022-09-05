import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			external: ['node:fs', 'node:fs/promises', 'node:path', 'node:url', 'fs', 'fs/promises', 'path', 'url']
		}
	},
	optimizeDeps: {
		include: ['highlight.js', 'highlight.js/lib/core'],
		exclude: ['node:fs/promises', 'node:path', 'node:url', 'fs', 'fs/promises', 'path', 'url'],
		esbuildOptions: {
			platform: 'node'
		}
	}
};

export default config;
