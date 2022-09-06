import fs from 'fs';
import path from 'path';

const docFilePath = process.cwd() + '/src/routes/(docs)/(api-reference)/api-reference/';
const indexFiles = ['index', 'README'];

function processDirectoryFiles(directoryPath) {
	for (const file of fs.readdirSync(directoryPath, { encoding: 'utf-8', withFileTypes: true })) {
		if (file.isFile() && file.name.endsWith('.md')) {
			if (file.name === '+page.md') {
				console.warn('Encountering already processed +page.md files, aborting!');

				return;
			}

			const fullFileName = file.name;
			const fileName = fullFileName.substring(0, fullFileName.length - 3);

			processMarkdownFile(path.join(directoryPath, fullFileName));

			if (indexFiles.includes(fileName)) {
				fs.renameSync(path.join(directoryPath, fullFileName), path.join(directoryPath, '+page.md'));
			} else {
				let newDirectoryName = fileName.replace('.', '/');

				if (newDirectoryName.startsWith('index/')) {
					newDirectoryName = newDirectoryName.substring(6);
				}

				fs.mkdirSync(path.join(directoryPath, newDirectoryName), { recursive: true });
				fs.renameSync(
					path.join(directoryPath, fullFileName),
					path.join(directoryPath, newDirectoryName, '+page.md')
				);
			}
		} else if (file.isDirectory()) {
			processDirectoryFiles(path.join(directoryPath, file.name));
		}
	}
}

const escapeReplace = /[&<'{]|\\>/g;
const escapeReplacements = {
	'&': '&amp;',
	'<': '&amp;lt;',
	'>': '&amp;gt;',
	'\\>': '&amp;gt;',
	"'": '&amp;#39;',
	'{': '&amp;#123;'
};
const getEscapeReplacement = (ch) => escapeReplacements[ch];

function escape(html) {
	html = html.replace(escapeReplace, getEscapeReplacement);
	html = html.replace(/\[([\w\s]+)]:/, (_, group1) => `&amp;#91;${group1}&amp;&#93;:`);

	return html;
}

/**
 * @param url
 * @return {{path: string, fileName: string, fileExtension: string, hash: string}}
 */
function parseUrl(url) {
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

function fixRelativeUrls(markdownContent) {
	return markdownContent.replace(/]\((\/api-reference[\w-.#/$]+)\)/g, (_, url) => {
		const parsedUrl = parseUrl(url);

		let fixedUrl = parsedUrl.path.replace('.', '/').replace('/index', '');

		if (!indexFiles.includes(parsedUrl.fileName)) {
			fixedUrl += '/' + parsedUrl.fileName;
		}

		fixedUrl += parsedUrl.hash;

		return `](${fixedUrl})`;
	});
}

const titleMarkdownRegex = /^\s*#\s*((?:Class|Module|Interface|Enumeration):\s*\w+)/;

/**
 * @param {string} markdownContent
 * @return {string | undefined}
 */
function extractTitle(markdownContent) {
	const title = titleMarkdownRegex.exec(markdownContent);

	return title?.length && title?.length >= 2 ? title[1] : undefined;
}

/**
 * @param {string} markdownContent
 * @return {string}
 */
function buildFrontmatter(markdownContent) {
	let frontmatter = "---\nlayout: 'api-reference'\n";

	const title = extractTitle(markdownContent);
	if (title) {
		frontmatter += `title: '${title}'\n`;
	}

	return frontmatter + '---\n\n';
}

function processMarkdownFile(filePath) {
	let data = fs.readFileSync(filePath, { encoding: 'utf-8' });
	const fileDescriptor = fs.openSync(filePath, 'w+');
	data = fixRelativeUrls(escape(data));

	const frontmatter = Buffer.from(buildFrontmatter(data));

	fs.writeSync(fileDescriptor, Buffer.concat([frontmatter, Buffer.from(data)]));

	fs.close(fileDescriptor);
}

processDirectoryFiles(docFilePath);

console.info(`Processed typedoc markdown files in directory ${docFilePath}`);
