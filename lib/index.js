// Node-js built-in modules.
const {
	basename,
	dirname,
	join,
	relative,
	resolve
} = require('path');
const {
	access,
	mkdir,
	readFile,
	writeFile,
	constants: {
		R_OK
	}
} = require('fs');
const {
	promisify
} = require('util');

// Old third-party modules.
const ejs = require('ejs');
const {
	CLIEngine: ESLint
} = require('eslint');

// New third-party modules.
const {
	transform,
	transformFromAst
} = require('babel-core');
const glob = require('glob');

// Asynchronous functions.
const [
	accessAsync, mkdirAsync, readFileAsync, writeFileAsync, globAsync
] = [access, mkdir, readFile, writeFile, glob].map(promisify);

async function build(options = {}, callback) {
	const {
		name,
		inDir: targetDirectory,
		outDir: outputDirectory,
		lint,
		minify,
		useSourceMap,
		variables,
		walkOption
	} = Object.assign({ // eslint-disable-line no-param-reassign
		name: 'Project',
		inDir: dirname(require.main.filename),
		outDir: resolve(dirname(require.main.filename), '../out'),
		lint: {
			check: true,
			options: {}
		},
		minify: true,
		useSourceMap: true,
		variables: {},
		walkOption: {
			head: 'Intro',
			tail: 'Outro',
			ext: 'js'
		}
	}, options);

	if (typeof callback !== 'function') {
		const message = 'swint-builder-js function needs callback';

		global.print(4, message);

		throw new Error(message);
	}

	try {
		await accessAsync(targetDirectory, R_OK);
	} catch (error) {
		const message = 'swint-builder-js: inDir doesn\'t exist';

		callback(message, false);

		throw new Error(message);
	}

	try {
		await accessAsync(outputDirectory, R_OK);
	} catch (error) {
		await mkdirAsync(outputDirectory);
	}

	// ESLint
	if (lint.check) {
		const engine = new ESLint(lint.options);
		const report = engine.executeOnFiles([relative(process.cwd(), targetDirectory)]);

		if (report.errorCount || report.warningCount) {
			global.print(4, (ESLint.getFormatter())(report.results));
			callback('Lint error', report);

			throw Object.assign(new Error('Lint error'), {
				report
			});
		}
	}

	// Bundle the application.
	const targetFilenames = (await globAsync(`${targetDirectory}/**/*${walkOption.ext}`)).sort((left, right) => {
		const basenames = {
			left: basename(left),
			right: basename(right)
		};
		const dirnames = {
			left: dirname(basenames.left),
			right: dirname(basenames.right)
		};

		const filenames = {
			left: basename(basenames.left, `.${walkOption.ext}`),
			right: basename(basenames.right, `.${walkOption.ext}`)
		};

		if (filenames.left === walkOption.head) {
			return -1;
		}

		if (filenames.right === walkOption.head) {
			return 1;
		}

		if (filenames.left === walkOption.tail) {
			return 1;
		}

		if (filenames.right === walkOption.tail) {
			return -1;
		}

		if (dirnames.left === filenames.left) {
			return -1;
		}

		if (dirnames.right === filenames.right) {
			return 1;
		}

		return 0;
	});

	const concatenatedData = await Promise.all(targetFilenames.map(filename => (
		readFileAsync(filename, 'utf8')
	))).then(fileData => (
		fileData.join('\n')
	));

	const variablesBoundData = ejs.render(concatenatedData, variables);

	// Transpile the application.
	const {
		code: transpiledCode,
		map: transpiledSourceMapData,
		ast: transpiledAST
	} = transform(variablesBoundData, {
		presets: [
			['env', {
				targets: {
					browsers: 'last 2 versions'
				}
			}]
		],

		plugins: [
			'transform-object-rest-spread',
			'transform-export-extensions',
			'transform-async-generator-functions',
			'transform-do-expressions',
			'transform-function-bind',
			'transform-decorators-legacy', ['transform-class-properties', {
				spec: true
			}]
		],

		sourceMaps: true
	});

	// Prepare to write files.
	const writers = [writeFileAsync(join(outputDirectory, `${name}.js`), transpiledCode)];

	if (useSourceMap) {
		writers.push(writeFileAsync(
			join(outputDirectory, `${name}.js.map`),
			JSON.stringify({
				transpiledSourceMapData,
				sources: [`${name}.js`]
			})
		));
	}

	// Minify the application.
	if (minify) {
		const {
			code: minifiedCode,
			map: minifiedSourceMapData
		} = transformFromAst(transpiledAST, variablesBoundData, {
			presets: [
				['minify', {
					deadcode: false
				}]
			],
			sourceMaps: true,
			inputSourceMap: transpiledSourceMapData
		});

		writers.push(writeFileAsync(join(outputDirectory, `${name}.min.js`), minifiedCode));

		if (useSourceMap) {
			writers.push(writeFileAsync(
				join(outputDirectory, `${name}.min.js.map`),
				JSON.stringify({
					minifiedSourceMapData,
					sources: [`${name}.min.js`]
				})
			));
		}
	}

	await Promise.all(writers).then(() => callback(undefined, true));
}

module.exports = build;
