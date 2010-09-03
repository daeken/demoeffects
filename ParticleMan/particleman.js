var graph;

function shelf(id, graph) {
	this.id = id;
	this.graph = graph;
	this.focus = null;
	this.blur = null;
}

shelf.prototype.add = function(obj) {
	var name = obj.name;
	var elem = $('<tr><td style="background: transparent">' + name + '</td></tr>');
	var sthis = this;
	elem.children('td').dblclick(
		function(e) {
			(e.originalEvent || e).preventDefault();
			
			var node = new graphNode(null, name);
			if(obj.inputs != undefined)
				for(var i in obj.inputs)
					node.addPoint(obj.inputs[i], 'in');
			if(obj.outputs != undefined)
				for(var i in obj.outputs)
					node.addPoint(obj.outputs[i], 'out');
			sthis.graph.addNode(Math.floor(Math.random() * 400) + 20, Math.floor(Math.random() * 200) + 20, node);
			if(sthis.focus != null)
				node.focus(sthis.focus);
			if(sthis.blur != null)
				node.blur(sthis.blur);
			if(obj.focus != undefined)
				node.focus(obj.focus);
			
			if(obj.init != undefined)
				obj.init(node);
		}
	);
	$('#' + this.id + ' > tbody:last').append(elem);
}

function ready() {
	theme = {pointActive: 'red'};
	
	var notice = $('#no-nodes');
	var properties = null;
	var graph = new graphEditor('graph-editor', 640, 300, theme);
	var cshelf = new shelf('shelf', graph);
	var psystem = new particleSystem('c');
	
	cshelf.focus = function() {
		notice.hide();
	}
	cshelf.blur = function() {
		notice.show();
		if(properties != null)
			properties.hide();
	}
	
	cshelf.add({
		name: 'Emitter', 
		inputs: ['X', 'Y', 'Speed', 'Lifetime'], 
		outputs: [], 
		init: function(node) {
			node.x = 320;
			node.y = 240;
			node.speed = 1;
			node.lifetime = 100;
			var cemitter = psystem.add(new emitter(node.x, node.y, node.speed, 0, node.lifetime));
			node.update(
				function() {
					cemitter.x = node.x;
					cemitter.y = node.y;
					cemitter.speed = node.speed;
					cemitter.lifetime = node.lifetime;
				}
			);
		}, 
		focus: function(node) {
			properties = $('#emitter-properties').show();
			function setup(name) {
				var jelem = $('#emitter-' + name);
				jelem.val(node[name]);
				jelem.unbind('change');
				jelem.change(function() { node[name] = parseFloat(jelem.val()); node.update(); });
			}
			setup('x');
			setup('y');
			setup('speed');
			setup('lifetime');
		}
	});
	cshelf.add({
		name: 'Attractor', 
		inputs: ['X', 'Y', 'Gravity'], 
		outputs: [], 
		init: function(node) {
			node.x = 320;
			node.y = 240;
			node.gravity = 1;
			var cattractor = psystem.add(new attractor(node.x, node.y, node.gravity));
			node.update(
				function() {
					cattractor.x = node.x;
					cattractor.y = node.y;
					cattractor.gravity = node.gravity;
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
}