import fs from 'fs';
import path from 'path';

const docFilePath = process.cwd() + '/src/routes/(docs)/(api-reference)/api-reference/';
const indexFiles = ['', 'README'];

/**
 * @param {string} directoryPath
 */
function processDirectoryFiles(directoryPath) {
    for (const file of fs.readdirSync(directoryPath, { encoding: 'utf-8', withFileTypes: true })) {
        if (file.isFile() && file.name.endsWith('.md')) {
            if (file.name === '+page.md') {
                console.warn('Encountering already processed +page.md files, aborting!');

                return;
            }

            const fullFileName = file.name;

            // Remove weird absolute path ending in src_lib_ or src_lib.
            const fileName = fullFileName.substring(
                fullFileName.indexOf('_src_lib') + '_src_lib_'.length,
                fullFileName.length - 3
            );

            processMarkdownFile(path.join(directoryPath, fullFileName));

            if (fullFileName === 'README.md') {
                fs.renameSync(path.join(directoryPath, fullFileName), path.join(directoryPath, '+page.md'));

                continue;
            }

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

/**
 * @param {string} html
 * @returns {string}
 */
function escape(html) {
    html = html.replace(escapeReplace, getEscapeReplacement);
    html = html.replace(/\[([\w\s]+)]:/, (_, group1) => `&amp;#91;${group1}&amp;&#93;:`);

    return html;
}

/**
 * @param {string} url
 * @return {{path: string, fileName: string, fileExtension: string, hash: string}}
 */
function parseUrl(url) {
    url = url.replace(/\/[_\w]+_src_lib[/._]/, '/');

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

/**
 * @param {string} markdownContent
 * @returns {string}
 */
function fixUrls(markdownContent) {
    return markdownContent.replace(
        /\[([:./\-\w]+)]\(([\w:\-_.#/$]+)\)/g,
        /**
         * @param label {string}
         * @param url {string}
         */
        (_, label, url) => {
            const isExternalUrl = url.startsWith('http');
            const isBrokenUrl = url.includes('_src_lib') && !isExternalUrl;
            const isBrokenLabel = label.includes('/src/lib');

            let fixedUrl = url;
            let fixedLabel = label;

            if (isBrokenUrl) {
                const parsedUrl = parseUrl(url);

                fixedUrl = parsedUrl.path.replace('.', '/').replace('/index', '');

                if (!indexFiles.includes(parsedUrl.fileName)) {
                    fixedUrl += '/' + parsedUrl.fileName;
                }

                fixedUrl += parsedUrl.hash;

                fixedUrl = fixedUrl.replaceAll(/\/{2,}/g, '/').replaceAll(/\/#/g, '#');
            }

            if (isBrokenLabel) {
                fixedLabel = fixedLabel.replace(/[./\w-_]+\/src\/lib\/?/, '');

                if (!fixedLabel) {
                    fixedLabel = 'index';
                }
            }

            console.log(url, '\n->', fixedUrl, '\n');

            return `[${fixedLabel}](${fixedUrl})`;
        }
    );
}

/**
 * @param {string} markdownContent
 * @returns {string}
 */
function fixAbsolutePathsInText(markdownContent) {
    return markdownContent.replace(
        /[./\w-_@:]+\/src\/lib\/?([./\w-_@:]*)|[./\w-_@:]+\/(node_modules\/?[./\w-_@:]*)/g,
        /**
         * @param lastPartInSrcLib {string}
         * @param lastPartInNodeModules {string}
         */
        (_, lastPartInSrcLib, lastPartInNodeModules) => {
            return lastPartInSrcLib ?? lastPartInNodeModules ?? 'index';
        }
    );
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

/**
 *
 * @param {string} filePath
 */
function processMarkdownFile(filePath) {
    let data = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const fileDescriptor = fs.openSync(filePath, 'w+');
    data = fixAbsolutePathsInText(fixUrls(escape(data.replaceAll('`', ''))));

    const frontmatter = Buffer.from(buildFrontmatter(data));

    fs.writeSync(fileDescriptor, Buffer.concat([frontmatter, Buffer.from(data)]));

    fs.close(fileDescriptor);
}

processDirectoryFiles(docFilePath);

console.info(`Processed typedoc markdown files in directory ${docFilePath}`);
