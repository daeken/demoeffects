var graph;

function ready() {
	graph = new graphEditor('graph-editor', 320, 240);
	graph.addNode(100, 100, new graphNode('foo', 'bar'));
}