function graphEditor(id, width, height) {
	sthis = this;
	this.raphael = Raphael(id, width, height);
	this.raphael.rect(0, 0, width, height).attr({
			fill: '#fff',
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
	
	var temp = [];
	ly = y+35;
	mx = 0;
	for(i in node.points) {
		var point = node.points[i];
		if(point.dir == 'out') continue;
		circle = this.raphael.circle(x+7.5, ly, 5).attr({stroke: '#000', fill: '#ddd'}).toFront();
		label = this.raphael.text(x+25, ly, point.label).attr({fill: '#000', 'font-size': 12}).toFront();
		bbox = label.getBBox();
		ly += bbox.height + 5;
		if(bbox.width > mx)
			mx = bbox.width;
		temp.push(circle);
		temp.push(label);
	}
	lx = (mx != 0) ? mx + 25 : 0;
	lx += x + 25;
	mx = 0;
	my = ly;
	labels = [];
	ly = y+35;
	for(i in node.points) {
		var point = node.points[i];
		if(point.dir == 'in') continue;
		label = this.raphael.text(lx, ly, point.label).attr({fill: '#000', 'font-size': 12}).toFront()
		bbox = label.getBBox();
		ly += bbox.height + 5;
		if(bbox.width > mx)
			mx = bbox.width;
		labels.push(label);
	}
	ly = y+35;
	ex = lx + mx + 17.5;
	for(i in labels) {
		var label = labels[i];
		circle = this.raphael.circle(ex, ly, 5).attr({stroke: '#000', fill: '#ddd'}).toFront();
		bbox = label.getBBox();
		ly += bbox.height + 5;
		temp.push(circle);
		temp.push(label);
	}
	
	var set = node.element = this.raphael.set().push(
		this.raphael.rect(x, y, ex+10 - x, Math.max(my, ly) - y, 10).attr({fill: '#eee'}), 
		this.raphael.text(x+20, y+15, node.title).attr({fill: '#000', 'font-size': 16, 'font-weight': 'bold'})
	);
	for(i in temp)
		set.push(temp[i].toFront());
	
	var suppressSelect = false;
	set.click(
		function() {
			if(suppressSelect == true) {
				suppressSelect = false;
				return false;
			}
			if(node.selected)
				node.blur();
			else
				node.focus();
		}
	);
	
	function start() {
		this.cx = this.cy = 0;
		this.moved = false;
		set.animate({'fill-opacity': 0.4}, 250);
	}
	function move(dx, dy) {
		set.translate(dx - this.cx, dy - this.cy);
		this.cx = dx;
		this.cy = dy;
		this.moved = true;
		sthis.raphael.safari();
	}
	function end() {
		set.animate({'fill-opacity': 1}, 250);
		if(this.moved != false)
			suppressSelect = true;
	}
	set.drag(move, start, end);
}

function graphNode(id, title) {
	this.id = id;
	this.title = title;
	this.points = [];
	
	this.focusHooks = [];
	this.blurHooks = [];
	this.selected = false;
	
	return true;
}

graphNode.prototype.addPoint = function(label, dir) {
	this.points.push(new point(label, dir));
	return this;
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

function point(label, dir) {
	this.label = label;
	this.dir = dir;
	
	this.connections = [];
	
	return true;
}
