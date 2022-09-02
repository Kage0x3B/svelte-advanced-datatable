import { error } from '@sveltejs/kit';
import path from 'path';
import { buildMarkdown } from './markdownUtil.js';

export async function load({ params }: { params: { slug: string } }): Promise<{ pageContent: string }> {
	const slug = params.slug.replace(/\s\//, '').length === 0 ? 'README' : params.slug;
	console.log('SLUG:', params.slug, '->', slug);

	const data = await buildMarkdown({
		filePath: path.join(process.cwd(), 'src/routes/(docs)/api-docs/files', slug + '.md'),
		baseUrl: '/api-docs/'
	});

	if (data) {
		return data;
	}

	throw error(404, 'Not found');
}
