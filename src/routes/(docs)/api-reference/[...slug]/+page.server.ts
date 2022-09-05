import { error } from '@sveltejs/kit';
import path from 'path';
import { buildMarkdown, parseSlug } from '../util/markdownUtil.js';

export async function load({ params }: { params: { slug: string } }): Promise<{ title: string; pageContent: string }> {
	const slug = parseSlug(params.slug);
	const data = await buildMarkdown(path.join(process.cwd(), 'src/routes/(docs)/api-reference/files', slug + '.md'));

	if (data) {
		return data;
	}

	throw error(404, 'Not found');
}
