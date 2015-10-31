var os = require('os'),
	fs = require('fs'),
	path = require('path'),
	assert = require('assert'),
	swintHelper = require('swint-helper'),
	buildJS = require('../lib');

global.swintVar.printLevel = 5;

describe('builder-js', function() {
	it('Error when no callback', function() {
		assert.throws(function() {
			buildJS({});
		});
	});

	it('Error when inDir doesn\'t exist', function(done) {
		buildJS({
			inDir: '/this-directory-does-not-exist'
		}, function(err, res) {
			assert.notEqual(err, null);
			done();
		});
	});

	it('Common case', function(done) {
		buildJS({
			name: 'Test',
			inDir: path.join(__dirname, '../test_case'),
			outDir: path.join(os.tmpdir(), 'swint-builder-js-out'),
			minify: true,
			variables: {
				tmplVar: 'A'
			}
		}, function(err, res) {
			assert.deepEqual(
				fs.readFileSync(path.join(os.tmpdir(), 'swint-builder-js-out/Test.js'), 'utf-8'),
				fs.readFileSync(path.join(__dirname, '../test_result/common.js'), 'utf-8')
			);

			assert.deepEqual(
				fs.readFileSync(path.join(os.tmpdir(), 'swint-builder-js-out/Test.min.js'), 'utf-8'),
				fs.readFileSync(path.join(__dirname, '../test_result/common.min.js'), 'utf-8')
			);

			assert.deepEqual(
				JSON.parse(fs.readFileSync(path.join(os.tmpdir(), 'swint-builder-js-out/Test.min.js.map'), 'utf-8')),
				JSON.parse(fs.readFileSync(path.join(__dirname, '../test_result/common.min.js.map'), 'utf-8'))
			);

			done();
		});
	});

	after(function() {
		fs.unlinkSync(path.join(os.tmpdir(), 'swint-builder-js-out/Test.js'));
		fs.unlinkSync(path.join(os.tmpdir(), 'swint-builder-js-out/Test.min.js'));
		fs.unlinkSync(path.join(os.tmpdir(), 'swint-builder-js-out/Test.min.js.map'));
		fs.rmdirSync(path.join(os.tmpdir(), 'swint-builder-js-out'));
	});
});
