var os = require('os'),
	fs = require('fs'),
	path = require('path'),
	assert = require('assert'),
	swintHelper = require('swint-helper'),
	buildJS = require('../lib');

describe('builder-js', function() {
	it('Simple case', function(done) {
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
			 	"(function(window) {\n\nvar namespace = {};\nnamespace.class1 = function() {\n\tthis.foo = 'bar';\n};\n\
namespace.class2 = function() {\n\n\tthis.foo = 'bar';\n\n};\n})(window);\n"
			);
			done();
		});
	});
});
