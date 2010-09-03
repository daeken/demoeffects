var graph;

function ready() {
	graph = new graphEditor('graph-editor', 640, 300);
	graph.addNode(100, 100, new graphNode('foo', 'bar'));
	graph.addNode(200, 200, new graphNode('baz', 'hax'));
}