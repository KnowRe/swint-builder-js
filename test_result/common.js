"use strict";

(function (window) {

	var namespace = {};

	/* global namespace */

	namespace.class1 = function () {
		this.foo = "bar";
	};

	/* global namespace */

	namespace.class2 = function () {
		/*!  */
		this.foo = 'bar';
		/*!  */
	};
})(window);