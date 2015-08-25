var os = require('os'),
	fs = require('fs'),
	path = require('path'),
	assert = require('assert'),
	swintHelper = require('swint-helper'),
	buildJS = require('../lib');

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
			outDir: os.tmpdir(),
			minify: true,
			variables: {
				tmplVar: 'A'
			}
		}, function(err, res) {
			var file = fs.readFileSync(path.join(os.tmpdir(), 'Test.js'), { encoding: 'utf8' });

			assert.equal(
				file,
				fs.readFileSync(path.join(__dirname, '../test_result/common.js'))
			);
			done();
		});
	});
});
