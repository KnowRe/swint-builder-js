'use strict';

var path = require('path'),
	fs = require('fs'),
	ejs = require('ejs'),
	sprintf = require('sprintf').sprintf,
	eslint = require('eslint').CLIEngine,
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
			options: {}
		},
		minify: true,
		useSourceMap: true,
		variables: {},
		walkOption: {
			ext: 'js'
		}
	}, options);

	return proceed(options, callback);
};

var proceed = function(options, callback) {
	if (callback === undefined) {
		var msg = 'swint-builder-js function needs callback';
		print(4, msg);
		throw new Error(msg);
	}

	if (!fs.existsSync(options.inDir)) {
		callback('swint-builder-js: inDir doesn\'t exist', false);
		return;
	}

	if (!fs.existsSync(options.outDir)) {
		fs.mkdirSync(options.outDir);
	}

	if (options.lint.check) {
		var engine = new eslint(options.lint.options),
			report = engine.executeOnFiles([path.relative(process.cwd(), options.inDir)]);

		if (report.errorCount || report.warningCount) {
			print(4, (eslint.getFormatter())(report.results));
			callback('Lint error', report);
			return;
		}
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

	if (options.minify) {
		var outMin = path.join(options.outDir, sprintf('%s.min.js', options.name)),
			outMap = path.join(options.outDir, sprintf('%s.min.js.map', options.name)),
			ugly = uglifyJS.minify(outputRaw, {
				sourceMap: options.useSourceMap ? {
					filename: sprintf('%s.min.js.map', options.name),
					url: sprintf('%s.min.js.map', options.name)
				} : false,
				warnings: true,
				compress: {
					join_vars: false,
					collapse_vars: true,
					unused: false
				}
			}), mapped;

		fs.writeFileSync(outMin, ugly.code);

		if (options.useSourceMap) {
			mapped = JSON.parse(ugly.map);
			mapped.sources = [ sprintf('%s.js', options.name) ];
			fs.writeFileSync(outMap, JSON.stringify(mapped));
		}
	}

	if (callback !== undefined) {
		callback(null, true);
	}
};

