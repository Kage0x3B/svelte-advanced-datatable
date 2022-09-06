import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md', '.svx'],
	preprocess: [
		preprocess(),
		mdsvex({
			extensions: ['.md', '.svx'],
			layout: {
				'api-reference': './src/routes/util/layout/api-reference-layout.svelte',
				docs: './src/routes/util/layout/docs-layout.svelte'
			}
		})
	],
	kit: {
		adapter: adapter(),
		prerender: {
			default: true
		}
	},
	package: {
		exports: (filepath) => filepath.endsWith('index.ts')
	}
};

export default config;
