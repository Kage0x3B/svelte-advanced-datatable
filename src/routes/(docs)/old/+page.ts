import type { LoadEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import type { SvelteComponentTyped } from 'svelte';
import { parseSlug } from './util/markdownUtil.js';

export async function load({
	params,
	fetch
}: LoadEvent<{ slug: string }>): Promise<{ title: string; pageContent: SvelteComponentTyped }> {
	try {
		console.log("TEST");
		const files = await import.meta.glob('../files/*.md');
		console.log('files', files);

		const slug = parseSlug(params.slug);
		let pageData: { default: SvelteComponentTyped; metadata?: { title: string } };
		console.log(slug);

		if (slug.includes('/')) {
			const slugParts = slug.split('/');
			pageData = await import(`../files/${slugParts[0]}/${slugParts[1]}.md?raw`);
		} else {
			pageData = await import(`../files/${slug}.md?raw`);
		}
		//const post = await import(`../files/${params.slug}.md`);
		const content = pageData.default;
		console.log('post import', pageData);

		//const slug = parseSlug(params.slug);
		//const data = await buildMarkdown(path.join(process.cwd(), 'src/routes/(docs)/api-reference/files', slug + '.md'));

		if (content) {
			return {
				title: 'TODO',
				pageContent: content
			};
		}
	} catch (err) {
		console.error(err);
	}

	throw error(404, 'Not found');
}
