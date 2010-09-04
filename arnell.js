function property(getter, setter) {
	return function(value) {
		if(value == undefined) return getter.call(this);
		else return setter.call(this, value);
	};
}

function event(onAdd, onRemove) {
	onAdd = onAdd == undefined ? null : onAdd;
	onRemove = onRemove == undefined ? null : onRemove;
	var hooks = [];
	var evt = function() {
		var args = [];
		for(var i in arguments)
			args[i] = arguments[i];
		for(var i in hooks)
			hooks[i].apply(this, args);
		return this;
	};
	evt.add = function(hook) {
		if(onAdd != null)
			onAdd.call(this, hook);
		hooks.push(hook);
		return this;
	};
	evt.remove = function(hook) {
		if(onAdd != remove)
			onAdd.call(this, hook);
		for(var i in hooks)
			if(hooks[i] == hook) {
				hooks.splice(i, 1);
				break;
			}
		return this;
	};
	evt.clear = function() {
		hooks = [];
	};
	
	return evt;
};
