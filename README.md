# swint-builder-js
JavaScript builder for Swint. Walks a directory and concatenates the file on a certain order.

**Warning: This is not the final draft yet, so do not use this until its official version is launched**

## Installation
```sh
$ npm install --save swint-builder-js
```

## Options
* `name` : `String`, default: `Project`
* `inDir` : `String`, default: `path.dirname(require.main.filename)`
* `outDir` : `String`, default: `path.join(path.dirname(require.main.filename), '../out')`
* `lint`
  * `check` : `Boolean`, default: `true`
  * `ruleFile` : `String`, default: `path.join(path.dirname(require.main.filename), 'eslint.json')`
* `minify` : `Boolean`, default: `true`
* `variables` : `Object`, default: `{}`
* `walkOption` : `Object`, default: `{ ext: 'js' }`

## Usage
```javascript
buildJS({
	name: 'Test',
	inDir: path.join(__dirname, 'js'),
	outDir: path.join(__dirname, 'out'),
	lint: {
		check: true,
		ruleFile: path.join(__dirname, 'js/eslint.json')
	},
	minify: true,
	variables: {
		tmplVar: 'A'
	}
}, function() {
	// Build complete
});
```
