function graphEditor(id, width, height) {
	sthis = this;
	this.raphael = Raphael(id, width, height);
	this.raphael.rect(0, 0, width, height).attr({
			fill: '#eee',
			stroke: '#222'
		});
	this.nodes = [];
	this.selected = null;
	
	return true;
}

graphEditor.prototype.addNode = function(x, y, node) {
	sthis = this;
	this.nodes.push(node);
	
	node.parent = this;
	node.focus(
		function(node) {
			if(sthis.selected != null)
				sthis.selected.blur();
			sthis.selected = node;
			node.element.attr('stroke-width', 3);
		}
	);
	node.blur(
		function(node) {
			sthis.selected = null;
			node.element.attr('stroke-width', 1);
		}
	);
	var set = node.element = this.raphael.set().push(
		this.raphael.rect(x, y, 100, 50, 10).attr('fill', '#ccc'), 
		this.raphael.text(x+20, y+20, node.body).attr('fill', '#000').attr('font-size', 20)
	);
	
	set.click(
		function() {
			if(node.selected)
				node.blur();
			else
				node.focus();
		}
	);
	
	function start() {
		this.cx = this.cy = 0;
		set.animate({'fill-opacity': 0.1}, 250);
	}
	function move(dx, dy) {
		set.translate(dx - this.cx, dy - this.cy);
		this.cx = dx;
		this.cy = dy;
		sthis.raphael.safari();
	}
	function end() {
		set.animate({'fill-opacity': 1}, 250);
	}
	set.drag(move, start, end);
}

function graphNode(id, body) {
	this.id = id;
	this.body = body;
	
	this.focusHooks = [];
	this.blurHooks = [];
	this.selected = false;
	
	return true;
}

graphNode.prototype.focus = function(hook) {
	if(hook == undefined) {
		this.selected = true;
		for(hook in this.focusHooks)
			this.focusHooks[hook](this);
	} else
		this.focusHooks.push(hook);
}

graphNode.prototype.blur = function(hook) {
	if(hook == undefined) {
		this.selected = false;
		for(hook in this.blurHooks)
			this.blurHooks[hook](this);
	} else
		this.blurHooks.push(hook);
}
