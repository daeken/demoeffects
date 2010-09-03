var graph;

function shelf(id, graph) {
	this.id = id;
	this.graph = graph;
	this.focus = null;
	this.blur = null;
	this.node = null;
	
	this.builders = {};
}

shelf.prototype.build = function(name) {
	var args = [];
	for(var i = 1; i < arguments.length; ++i)
		args.push(arguments[i]);
	this.builders[name].apply(this, args);
}

shelf.prototype.add = function(obj) {
	var name = obj.name;
	var elem = $('<tr><td style="background: transparent">' + name + '</td></tr>');
	var sthis = this;
	
	this.builders[name] = function() {
		var node = new graphNode(null, name);
		if(obj.inputs != undefined)
			for(var i in obj.inputs)
				node.addPoint(obj.inputs[i], 'in');
		if(obj.outputs != undefined)
			for(var i in obj.outputs)
				node.addPoint(obj.outputs[i], 'out');
		sthis.graph.addNode(Math.floor(Math.random() * 400) + 20, Math.floor(Math.random() * 100) + 20, node);
		if(sthis.focus != null)
			node.focus(sthis.focus);
		if(sthis.blur != null)
			node.blur(sthis.blur);
		if(obj.focus != undefined)
			node.focus(obj.focus);
		
		if(obj.init != undefined) {
			var args = [node];
			for(var i in arguments)
				args.push(arguments[i]);
			obj.init.apply(obj, args);
		}
		return obj;
	};
	
	elem.children('td').dblclick(
		function(e) {
			(e.originalEvent || e).preventDefault();
			
			sthis.builders[name]();
		}
	);
	$('#' + this.id + ' > tbody:last').append(elem);
}

function ready() {
	theme = {pointActive: 'red'};
	
	var deleteNode = $('#delete-node');
	var notice = $('#no-nodes');
	var properties = null;
	var graph = new graphEditor('graph-editor', 640, 300, theme);
	var cshelf = new shelf('shelf', graph);
	var psystem = new particleSystem('c');
	
	cshelf.focus = function(node) {
		deleteNode.show();
		deleteNode.unbind('click');
		deleteNode.click(
			function() {
				node.remove();
			}
		);
		notice.hide();
	}
	cshelf.blur = function() {
		deleteNode.hide();
		notice.show();
		if(properties != null)
			properties.hide();
	}
	
	cshelf.add({
		name: 'Emitter', 
		inputs: ['X', 'Y', 'Speed', 'Lifetime', 'Color'], 
		outputs: [], 
		init: function(node, x, y, speed, lifetime, color) {
			node.x = x == undefined ? 320 : x;
			node.y = y == undefined ? 240 : y;
			node.speed = speed == undefined ? 1 : speed;
			node.lifetime = lifetime == undefined ? 100 : lifetime;
			node.color = color == undefined ? 'black' : color;
			var cemitter = psystem.add(new emitter(node.x, node.y, node.speed, 0, node.lifetime, node.color));
			node.update(
				function() {
					cemitter.x = node.x;
					cemitter.y = node.y;
					cemitter.speed = node.speed;
					cemitter.lifetime = node.lifetime;
					cemitter.color = node.color;
				}
			);
			node.remove(
				function() {
					psystem.remove(cemitter);
				}
			);
		}, 
		focus: function(node) {
			properties = $('#emitter-properties').show();
			function setup(name) {
				var jelem = $('#emitter-' + name);
				jelem.val(node[name]);
				jelem.unbind('change');
				jelem.change(function() {
					var val = parseFloat(jelem.val());
					if(val != val)
						val = jelem.val();
					node[name] = val;
					node.update();
				});
			}
			setup('x');
			setup('y');
			setup('speed');
			setup('lifetime');
			setup('color');
		}
	});
	cshelf.add({
		name: 'Attractor', 
		inputs: ['X', 'Y', 'Gravity'], 
		outputs: [], 
		init: function(node, x, y, gravity) {
			node.x = x == undefined ? 320 : x;
			node.y = y == undefined ? 240 : y;
			node.gravity = gravity == undefined ? 1 : gravity;
			var cattractor = psystem.add(new attractor(node.x, node.y, node.gravity));
			node.update(
				function() {
					cattractor.x = node.x;
					cattractor.y = node.y;
					cattractor.gravity = node.gravity;
				}
			);
			node.remove(
				function() {
					psystem.remove(cattractor);
				}
			);
		}, 
		focus: function(node) {
			properties = $('#attractor-properties').show();
			function setup(name) {
				var jelem = $('#attractor-' + name);
				jelem.val(node[name]);
				jelem.unbind('change');
				jelem.change(function() { node[name] = parseFloat(jelem.val()); node.update(); });
			}
			setup('x');
			setup('y');
			setup('gravity');
		}
	});
	cshelf.add({
		name: 'Evaluator', 
		inputs: ['Code'], 
		outputs: ['Value'], 
		init: function(node, code) {
			node.code = code == undefined ? 'Math.sin(time) * 10' : code;
		}, 
		focus: function(node) {
			properties = $('#evaluator-properties').show();
			function setup(name) {
				var jelem = $('#evaluator-' + name);
				jelem.val(node[name]);
				jelem.unbind('change');
				jelem.change(function() { node[name] = jelem.val(); node.update(); });
			}
			setup('code');
		}
	});
	
	cshelf.build('Emitter', 150, 350, 1, 150, 'rgba(255, 0, 0, 0.75)');
	cshelf.build('Emitter', 320, 240, 1, 100, 'rgba(0, 0, 255, 0.75)');
	cshelf.build('Attractor', 300, 200, 1);
}