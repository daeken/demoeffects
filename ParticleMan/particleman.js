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
			sthis.graph.addNode(50, 50, node);
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
	cshelf.focus = function() {
		notice.hide();
	}
	cshelf.blur = function() {
		notice.show();
		if(properties != null)
			properties.hide();
	}
	
	cshelf.add({
		name: 'Circle', 
		inputs: ['Radius'], 
		outputs: ['Particle'], 
		init: function(node) {
			node.radius = 1.0;
		}, 
		focus: function(node) {
			properties = $('#circle-properties').show();
			$('#circle-radius').val(node.radius);
		}
	});
	cshelf.add({
		name: 'Cannon', 
		inputs: ['Particle', 'Speed']
	});
	cshelf.add({
		name: 'Attractor', 
		inputs: ['Gravity']
	});
	
	var psystem = new particleSystem('c');
}