import fs from 'fs/promises';
import { marked } from 'marked';
import { resolve } from 'url';
import { apiReferenceCategories } from './apiReferenceMeta.js';
import { DocsMarkdownRenderer } from './DocsMarkdownRenderer.js';

export function parseSlug(slug: string): string {
	if (!slug) {
		return 'README';
	}

	let resultingPath = '';

	const pathParts = slug.split('/');

	if (pathParts.length === 3) {
		resultingPath = `${pathParts[0]}/${pathParts[1]}.${pathParts[2]}`;
	}

	if (pathParts.length === 2) {
		if (apiReferenceCategories.includes(pathParts[1])) {
			resultingPath = `${pathParts[0]}/${pathParts[1]}`;
		} else {
			resultingPath = `${pathParts[0]}/index.${pathParts[1]}`;
		}
	}

	if (pathParts.length === 1) {
		resultingPath = `${pathParts[0]}/index`;
	}

	return resultingPath;
}

const uriProtocolRegex = /^(?:https?|mailto|data):/i;

export function compactUrl(currentFileUrlPath: string, url: string): string {
	if (!uriProtocolRegex.test(url)) {
		const parsedUrl = parseUrl(resolve(currentFileUrlPath, url));

		url =
			(parsedUrl.path.endsWith('/index')
				? parsedUrl.path.substring(0, parsedUrl.path.length - 6)
				: parsedUrl.path) + '/';
		url += ['index', 'readme'].includes(parsedUrl.fileName.toLowerCase()) ? '' : parsedUrl.fileName;

		if (parsedUrl.fileExtension !== '.md') {
			url += parsedUrl.fileExtension;
		}

		url += parsedUrl.hash;
	}

	return url;
}

function parseUrl(url: string): { path: string; fileName: string; fileExtension: string; hash: string } {
	let path = url.substring(0, url.lastIndexOf('/'));
	const filePart = url.substring(url.lastIndexOf('/'), url.includes('#') ? url.indexOf('#') : url.length);
	let fileName = filePart.substring(1, filePart.lastIndexOf('.'));
	const fileExtension = filePart.substring(filePart.lastIndexOf('.'));
	const hash = url.includes('#') ? url.substring(url.indexOf('#')) : '';

	if (fileName.includes('.')) {
		path += '/' + fileName.substring(0, fileName.indexOf('.'));
		fileName = fileName.substring(fileName.indexOf('.') + 1);
	}

	return {
		path,
		fileName,
		fileExtension,
		hash
	};
}

export async function buildMarkdown(filePath: string): Promise<
	| {
			title: string;
			pageContent: string;
	  }
	| undefined
> {
	try {
		const currentFileUrlPath =
			'/api-reference/' +
			filePath.substring(filePath.indexOf('/api-reference/files/') + '/api-reference/files/'.length);

		const markdownContent = await fs.readFile(filePath, 'utf-8');
		const title = extractTitle(markdownContent);
		const pageContent = marked(markdownContent, {
			renderer: new DocsMarkdownRenderer(currentFileUrlPath)
		});

		return {
			title,
			pageContent
		};
	} catch (err) {
		console.log(err);

		return undefined;
	}
}

const titleMarkdownRegex = /^\s*#\s*((?:Class|Module|Interface|Enumeration):\s*\w+)/;

function extractTitle(markdownContent: string): string {
	const title = titleMarkdownRegex.exec(markdownContent);

	return title?.length && title?.length >= 2 ? title[1] : 'Api Reference';
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

export function cleanUrl(sanitize: boolean | undefined, base: string | null, href: string | null): string | null {
	href ??= '';

	if (sanitize) {
		let protocol;

		try {
			protocol = decodeURIComponent(unescape(href)).replace(nonWordAndColonTest, '').toLowerCase();
		} catch (e) {
			return null;
		}

		if (
			protocol.indexOf('javascript:') === 0 ||
			protocol.indexOf('vbscript:') === 0 ||
			protocol.indexOf('data:') === 0
		) {
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
