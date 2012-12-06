global['Class'] = function () {
	var parent,
	methods,
	klass = function () {
		this.initialize.apply(this, arguments);
	},
	extend = function (destination, source) {
		for (var property in source) {
			destination[property] = source[property];
		}
		destination.$super =  function(method) {
			return this.$parent[method].apply(this.$parent, Array.prototype.slice.call(arguments, 1));
		}
		return destination;
	};

	if (typeof arguments[0] === 'function') {
		parent = arguments[0];
		methods = arguments[1];
	} else {
		methods = arguments[0];
	}

	if (parent !== undefined) {
		extend(klass.prototype, parent.prototype);
		klass.prototype.$parent = parent.prototype;
	}
	extend(klass.prototype, methods);
	klass.prototype.constructor = klass;

	if (!klass.prototype.initialize) klass.prototype.initialize = function () {};

	return klass;
};
Array.prototype.move = function (old_index, new_index) {
	if(new_index >= this.length){
		var k = new_index - this.length;
		while((k--) + 1){
			this.push(undefined);
		}
	}
	this.splice(new_index, 0, this.splice(old_index, 1)[0]);
	return this; // for testing purposes
};
