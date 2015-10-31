'use strict';

var path = require('path'),
	fs = require('fs'),
	ejs = require('ejs'),
	sprintf = require('sprintf').sprintf,
	linter = require('eslint').linter,
	uglifyJS = require('uglify-js'),
	swintHelper = require('swint-helper'),
	defaultize = swintHelper.defaultize,
	walk = swintHelper.walk,
	concat = swintHelper.concat;

module.exports = function(options, callback) {
	defaultize({
		name: 'Project',
		inDir: path.dirname(require.main.filename),
		outDir: path.join(path.dirname(require.main.filename), '../out'),
		lint: {
			check: true,
			ruleFile: path.join(__dirname, 'default_eslint.json')
		},
		minify: true,
		variables: {},
		walkOption: {
			ext: 'js'
		}
	}, options);

	return proceed(options, callback);
};

var proceed = function(options, callback) {
	if(callback === undefined) {
		var msg = 'swint-builder-js function needs callback';
		print(4, msg);
		throw new Error(msg);
	}

	if(!fs.existsSync(options.inDir)) {
		callback('swint-builder-js: inDir doesn\'t exist', false);
		return;
	}

	if(!fs.existsSync(options.outDir)) {
		fs.mkdirSync(options.outDir);
	}

	var walkOption = options.walkOption;
	walkOption.dir = options.inDir;

	var walkList = walk(walkOption),
		concated = concat(walkList),
		outputRaw = ejs.render(
			concated,
			options.variables
		),
		outFile = path.join(options.outDir, sprintf('%s.js', options.name));

	fs.writeFileSync(outFile, outputRaw);

	if(options.lint.check) {
		var messages = linter.verify(
				outputRaw,
				JSON.parse(fs.readFileSync(options.lint.ruleFile, { encoding: 'utf8' }))
			);

		if(messages.length) {
			callback('Lint error', false);
			return;
		}
	}

	if(options.minify) {
		var outMin = path.join(options.outDir, sprintf('%s.min.js', options.name)),
			outMap = path.join(options.outDir, sprintf('%s.min.js.map', options.name)),
			ugly = uglifyJS.minify(outputRaw, {
				outSourceMap: sprintf('%s.min.js.map', options.name),
				fromString: true,
				warnings: true
			}),
			mapped = JSON.parse(ugly.map);

		fs.writeFileSync(outMin, ugly.code);

		mapped.sources = [ sprintf('%s.js', options.name) ];
		fs.writeFileSync(outMap, JSON.stringify(mapped));
	}

	if(callback !== undefined) {
		callback(null, true);
	}
};

