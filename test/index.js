/* global describe, it, after */

const os = require('os');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

require('swint-helper');

const build = require('../lib');

global.swintVar.printLevel = 5;

describe('builder-js', () => {
	const tmpdir = os.tmpdir();

	it('Error when no callback', done => {
		build().catch(() => done());
	});

	it('Error when inDir doesn\'t exist', done => {
		build({
			inDir: '/this-directory-does-not-exist'
		}, () => {}).catch(error => {
			assert.notEqual(error, null);
			done();
		});
	});

	it('Common case', done => {
		build({
			name: 'Test',
			inDir: path.join(__dirname, '../test_case'),
			outDir: path.join(tmpdir, 'swint-builder-js-out'),
			minify: true,
			lint: {
				check: false
			},
			variables: {
				tmplVar: 'A'
			}
		}, () => {}).then(() => {
			assert.deepEqual(
				fs.readFileSync(path.join(tmpdir, 'swint-builder-js-out/Test.js'), 'utf-8'),
				fs.readFileSync(path.join(__dirname, '../test_result/common.js'), 'utf-8')
			);

			assert.deepEqual(
				fs.readFileSync(path.join(tmpdir, 'swint-builder-js-out/Test.min.js'), 'utf-8'),
				fs.readFileSync(path.join(__dirname, '../test_result/common.min.js'), 'utf-8')
			);

			assert.deepEqual(
				fs.readFileSync(path.join(tmpdir, 'swint-builder-js-out/Test.min.js.map'), 'utf-8'),
				fs.readFileSync(path.join(__dirname, '../test_result/common.min.js.map'), 'utf-8')
			);

			done();
		});
	});

	it('Linting', done => {
		build({
			name: 'Test',
			inDir: path.join(__dirname, '../test_case'),
			outDir: path.join(os.tmpdir(), 'swint-builder-js-out'),
			minify: true,
			lint: {
				check: true,
				options: {
					configFile: path.join(__dirname, '../test_case/.eslintrc'),
					ignorePath: path.join(__dirname, '../test_case/.eslintignore')
				}
			},
			variables: {
				tmplVar: 'A'
			}
		}, () => {}).catch(({
			report
		}) => {
			// console.log(report.results[0].messages);
			// console.log(report.results[1].messages);

			assert.equal(report.errorCount, 1);
			done();
		});
	});

	it('Minified (useSourceMap: false) case', done => {
		build({
			name: 'Test',
			inDir: path.join(__dirname, '../test_case'),
			outDir: path.join(tmpdir, 'swint-builder-js-out2'),
			minify: true,
			lint: {
				check: false
			},
			useSourceMap: false,
			variables: {
				tmplVar: 'A'
			}
		}, () => {}).then(() => {
			assert.deepEqual(
				fs.readFileSync(path.join(tmpdir, 'swint-builder-js-out2/Test.js'), 'utf-8'),
				fs.readFileSync(path.join(__dirname, '../test_result/common.js'), 'utf-8')
			);

			assert.deepEqual(
				fs.readFileSync(path.join(tmpdir, 'swint-builder-js-out2/Test.min.js'), 'utf-8'),
				fs.readFileSync(path.join(__dirname, '../test_result/common2.min.js'), 'utf-8')
			);

			done();
		});
	});

	after(() => {
		fs.unlinkSync(path.join(tmpdir, 'swint-builder-js-out/Test.js'));
		fs.unlinkSync(path.join(tmpdir, 'swint-builder-js-out/Test.js.map'));
		fs.unlinkSync(path.join(tmpdir, 'swint-builder-js-out/Test.min.js'));
		fs.unlinkSync(path.join(tmpdir, 'swint-builder-js-out/Test.min.js.map'));
		fs.rmdirSync(path.join(tmpdir, 'swint-builder-js-out'));

		fs.unlinkSync(path.join(tmpdir, 'swint-builder-js-out2/Test.js'));
		fs.unlinkSync(path.join(tmpdir, 'swint-builder-js-out2/Test.min.js'));
		fs.rmdirSync(path.join(tmpdir, 'swint-builder-js-out2'));
	});
});
