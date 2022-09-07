import { sveltekit } from '@sveltejs/kit/vite';
import type { Plugin, UserConfig } from 'vite';

const config: UserConfig = {
	plugins: [sveltekit(), viteIgnoreStaticImport(['broadcast-channel'])],
	optimizeDeps: {
		include: ['highlight.js', 'highlight.js/lib/core'],
		esbuildOptions: {
			platform: 'node'
		}
	}
};

function viteIgnoreStaticImport(importKeys: string[]): Plugin {
	return {
		name: 'vite-plugin-ignore-static-import',
		enforce: 'pre',
		// 1. insert to optimizeDeps.exclude to prevent pre-transform
		config(config) {
			config.optimizeDeps = {
				...(config.optimizeDeps ?? {}),
				exclude: [...(config.optimizeDeps?.exclude ?? []), ...importKeys]
			};
		},
		// 2. push a plugin to rewrite the 'vite:import-analysis' prefix
		configResolved(resolvedConfig) {
			const VALID_ID_PREFIX = `/@id/`;
			const reg = new RegExp(`${VALID_ID_PREFIX}(${importKeys.join('|')})`, 'g');
			// @ts-ignore
			resolvedConfig.plugins.push({
				name: 'vite-plugin-ignore-static-import-replace-idprefix',
				transform: (code) => (reg.test(code) ? code.replace(reg, (m, s1) => s1) : code)
			} as Plugin);
		},
		// 3. rewrite the id before 'vite:resolve' plugin transform to 'node_modules/...'
		resolveId: (id) => {
			if (importKeys.includes(id)) {
				return { id, external: true };
			}
		}
	};
}

export default config;
