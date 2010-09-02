function graphEditor(id, width, height) {
	sthis = this;
	this.raphael = Raphael(id, width, height);
	this.nodes = [];
	
	$(this.raphael.node).click(
		function(event) {
			sthis.addNode(event.clientX, event.clientY, new graphNode('hax', 'blah'));
		}
	);
	
	return true;
}

graphEditor.prototype.addNode = function(x, y, node) {
	this.nodes.push(node);
	
	circle = this.raphael.circle(x, y, 50);
	circle.attr('fill', '#ccc');
	circle.show();
	this.raphael.safari();
}

function graphNode(id, body) {
	this.id = id;
	this.body = body;
	
	return true;
}
