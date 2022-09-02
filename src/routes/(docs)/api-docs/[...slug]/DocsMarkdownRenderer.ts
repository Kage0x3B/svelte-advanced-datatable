import { Renderer } from 'marked';
import { cleanUrl, escape } from './markdownUtil.js';

export class DocsMarkdownRenderer extends Renderer<string> {
	hr(): string {
		return `<hr class='mt-4 mb-5' />`;
	}

	list(body: string, ordered: boolean, start: number): string {
		const isActionList = body.includes('action-list-group-marker');
		const type = isActionList ? 'div' : ordered ? 'ol' : 'ul';
		const attrs = ordered && start !== 1 ? ' start="' + start + '"' : '';

		return `<${type} ${attrs} class='list-group mt-3 mb-4'>\n${body}</${type}>\n`;
	}

	listitem(text: string): string {
		if (text.includes('</a>')) {
			return text.replaceAll('<a ', '<a class="action-list-group-marker list-group-item list-group-item-action"');
		} else {
			return `<li class='list-group-item'>${text}</li>\n`;
		}
	}

	checkbox(checked: boolean): string {
		return `<div>
  					<input class='form-check-input' type='checkbox' ${checked ? 'checked' : ''} disabled />
				</div>`;
	}

	table(header: string, body: string): string {
		if (body) body = `<tbody>${body}</tbody>`;

		return `<div class='table-responsive'><table class='table table-striped table-bordered table-hover'>\n<thead>\n${header}</thead>\n${body}</table></div>\n`;
	}

	tablerow(content: string): string {
		return `<tr>\n${content}</tr>\n`;
	}

	tablecell(
		content: string,
		flags: {
			header: boolean;
			align: 'center' | 'left' | 'right' | null;
		}
	): string {
		const type = flags.header ? 'th' : 'td';
		const attrs = flags.header ? 'scope="col"' : '';
		const tag = flags.align ? `<${type} align='${flags.align}' ${attrs}>` : `<${type}>`;

		return tag + content + `</${type}>\n`;
	}

	link(href: string | null, title: string | null, text: string): string {
		href = cleanUrl(this.options.sanitize, this.options.baseUrl ?? null, href);
		if (href === null) {
			return text;
		}

		const mdFileExtension = href.lastIndexOf('.md');

		if (mdFileExtension > 0) {
			href = href.substring(0, mdFileExtension) + href.substring(mdFileExtension + 3);
		}

		if (!href.startsWith('/api-docs/')) {
			href = '/api-docs/' + href;
		}

		let out = '<a href="' + escape(href, false) + '"';
		if (title) {
			out += ' title="' + title + '"';
		}
		out += '>' + text + '</a>';
		return out;
	}

	image(href: string, title: string, text: string): string {
		if (href === null) {
			return text;
		}

		let out = '<img src="' + href + '" alt="' + text + '"';
		if (title) {
			out += ' title="' + title + '"';
		}
		out += '>';
		return out;
	}
}
