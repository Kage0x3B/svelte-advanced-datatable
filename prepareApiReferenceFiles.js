import fs from 'fs';
import path from 'path';

const docFilePath = process.cwd() + '/src/routes/(docs)/(api-reference)/api-reference/';
const indexFiles = ['index', 'README'];

function processDirectoryFiles(directoryPath) {
	console.log('processing', directoryPath);
	for (const file of fs.readdirSync(directoryPath, { encoding: 'utf-8', withFileTypes: true })) {
		console.log(file);

		if (file.isFile() && file.name.endsWith('.md')) {
			if (file.name === '+page.md') {
				console.warn('Encountering already processed +page.md files, aborting!');

				return;
			}

			const fullFileName = file.name;
			const fileName = fullFileName.substring(0, fullFileName.length - 3);

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
	console.log('Moved files, new folder files:');
	for (const fullFileName of fs.readdirSync(directoryPath, { encoding: 'utf-8' })) {
		console.log(fullFileName);
	}
}

processDirectoryFiles(docFilePath);
