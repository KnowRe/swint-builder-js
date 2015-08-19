# swint-task
Batch task manager for Swint

**Warning: This is not the final draft yet, so do not use this until its official version is launched**

## Installation
```sh
$ npm install --save swint-task
```

## Usage
```javascript
var tasks = [
		{
			func: function(option, callback) {
				// task 1
				callback(null, true);
			}
		},
		{
			func: function(option, callback) {
				// task 2
				callback(null, option.value); // option.value === 42
			},
			option: {
				value: 42
			}
		},
		{
			func: function(option, callback) {
				setTimeout(function() {
					// task 3
					callback(null, true);
				}, 10);
			}
		}
	];

task(tasks, function(err, res) {
	// task 1, 2, 3 is executed, respectively
});

```
