import fs from 'fs/promises';
import { marked } from 'marked';
import { DocsMarkdownRenderer } from './DocsMarkdownRenderer.js';

export async function buildMarkdown(options: { baseUrl: string; filePath: string }): Promise<
	| {
			pageContent: string;
	  }
	| undefined
> {
	try {
		const markdownContent = await fs.readFile(options.filePath, 'utf-8');
		const pageContent = marked(markdownContent, {
			renderer: new DocsMarkdownRenderer()
		});

		return {
			pageContent
		};
	} catch (err) {
		console.log(err);
		return undefined;
	}
}

const escapeTest = /[&<>"']/;
const escapeReplace = /[&<>"']/g;
const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
const escapeReplacements: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;'
};
const getEscapeReplacement = (ch: string): string => escapeReplacements[ch];

export function escape(html: string, encode: boolean): string {
	if (encode) {
		if (escapeTest.test(html)) {
			return html.replace(escapeReplace, getEscapeReplacement);
		}
	} else {
		if (escapeTestNoEncode.test(html)) {
			return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
		}
	}

	return html;
}

/**
 * Remove trailing `c`'s. Equivalent to `str.replace(/c*$/, '')`.
 * `/c*$/` is vulnerable to REDOS.
 *
 * @param str
 * @param c
 * @param invert Remove suffix of non-c chars instead. Default falsey.
 */
export function rtrim(str: string, c: string, invert = false): string {
	const l = str.length;
	if (l === 0) {
		return '';
	}

	// Length of suffix matching the invert condition.
	let suffLen = 0;

	// Step left until we fail to match the invert condition.
	while (suffLen < l) {
		const currChar = str.charAt(l - suffLen - 1);
		if (currChar === c && !invert) {
			suffLen++;
		} else if (currChar !== c && invert) {
			suffLen++;
		} else {
			break;
		}
	}

	return str.slice(0, l - suffLen);
}

const baseUrls: Record<string, string> = {};
const justDomain = /^[^:]+:\/*[^/]*$/;
const protocol = /^([^:]+:)[\s\S]*$/;
const domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;

export function resolveUrl(base: string, href: string): string {
	if (!baseUrls[' ' + base]) {
		// we can ignore everything in base after the last slash of its path component,
		// but we might need to add _that_
		// https://tools.ietf.org/html/rfc3986#section-3
		if (justDomain.test(base)) {
			baseUrls[' ' + base] = base + '/';
		} else {
			baseUrls[' ' + base] = rtrim(base, '/', true);
		}
	}
	base = baseUrls[' ' + base];
	const relativeBase = base.indexOf(':') === -1;

	if (href.substring(0, 2) === '//') {
		if (relativeBase) {
			return href;
		}
		return base.replace(protocol, '$1') + href;
	} else if (href.charAt(0) === '/') {
		if (relativeBase) {
			return href;
		}
		return base.replace(domain, '$1') + href;
	} else {
		return base + href;
	}
}

const nonWordAndColonTest = /[^\w:]/g;
const originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

export function cleanUrl(
	sanitize: boolean | undefined,
	base: string | null,
	href: string | null
): string | null {
	href ??= '';

	if (sanitize) {
		let protocol;

		try {
			protocol = decodeURIComponent(unescape(href)).replace(nonWordAndColonTest, '').toLowerCase();
		} catch (e) {
			return null;
		}

		if (protocol.indexOf('javascript:') === 0 || protocol.indexOf('vbscript:') === 0 || protocol.indexOf('data:') === 0) {
			return null;
		}
	}

	if (base && !originIndependentUrl.test(href)) {
		href = resolveUrl(base, href);
	}

	try {
		href = encodeURI(href).replace(/%25/g, '%');
	} catch (e) {
		return null;
	}

	return href;
}
