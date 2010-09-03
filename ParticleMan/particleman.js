var graph;

function shelf(id, graph) {
	this.id = id;
	this.graph = graph;
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
		}
	);
	$('#' + this.id + ' > tbody:last').append(elem);
}

function ready() {
	theme = {pointActive: 'red'};
	
	var graph = new graphEditor('graph-editor', 640, 300, theme);
	var cshelf = new shelf('shelf', graph);
	cshelf.add({
		name: 'Circle', 
		inputs: ['Radius'], 
		outputs: ['Particle']
	})
	cshelf.add({
		name: 'Cannon', 
		inputs: ['Particle', 'Speed']
	});
	cshelf.add({
		name: 'Attractor', 
		inputs: ['Gravity']
	});
}