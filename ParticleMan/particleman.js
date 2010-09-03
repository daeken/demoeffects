var graph;

function ready() {
	theme = {pointActive: 'red'};
	
	graph = new graphEditor('graph-editor', 640, 300, theme);
	graph.addNode(100, 100, new graphNode('foo', 'bar').addPoint('Foo', 'out'));
	graph.addNode(200, 200, new graphNode('baz', 'hax').addPoint('Fog', 'in'));
	graph.addNode(300, 50, new graphNode('baz', 'hax').addPoint('Fin', 'in').addPoint('Zomg', 'out'));
	graph.addNode(400, 150, new graphNode('baz', 'holy').addPoint('Fin', 'in').addPoint('Zomg', 'out').addPoint('Zomg #2', 'out'));
}