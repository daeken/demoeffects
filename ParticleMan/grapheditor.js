Raphael.fn.connection = function (obj1, obj2, line, bg) {
    if (obj1.line && obj1.from && obj1.to) {
        line = obj1;
        obj1 = line.from;
        obj2 = line.to;
    }
    var bb1 = obj1.getBBox(),
        bb2 = obj2.getBBox(),
        p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
        {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
        {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
        {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
        {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
        {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
        {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
        {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
        d = {}, dis = [];
    for (var i = 0; i < 4; i++) {
        for (var j = 4; j < 8; j++) {
            var dx = Math.abs(p[i].x - p[j].x),
                dy = Math.abs(p[i].y - p[j].y);
            if ((i == j - 4) || (((i != 3 && j != 6) || p[i].x < p[j].x) && ((i != 2 && j != 7) || p[i].x > p[j].x) && ((i != 0 && j != 5) || p[i].y > p[j].y) && ((i != 1 && j != 4) || p[i].y < p[j].y))) {
                dis.push(dx + dy);
                d[dis[dis.length - 1]] = [i, j];
            }
        }
    }
    if (dis.length == 0) {
        var res = [0, 4];
    } else {
        res = d[Math.min.apply(Math, dis)];
    }
    var x1 = p[res[0]].x,
        y1 = p[res[0]].y,
        x4 = p[res[1]].x,
        y4 = p[res[1]].y;
    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
    var path = ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",");
    if (line && line.line) {
        line.bg && line.bg.attr({path: path}).toFront();
        line.line.attr({path: path}).toFront();
    } else {
        var color = typeof line == "string" ? line : "#000";
        return {
            bg: bg && bg.split && this.path(path).attr({stroke: bg.split("|")[0], fill: "none", "stroke-width": bg.split("|")[1] || 3}),
            line: this.path(path).attr({stroke: color, fill: "none"}).toFront(),
            from: obj1,
            to: obj2
        };
    }
};

Raphael.fn.removeConnection = function(connection) {
	connection.line.remove();
	connection.bg.remove();
};

Raphael.el.xlateText = function() {
	this.translate(this.getBBox().width / 2, 0);
	return this;
};

var connecting = null;
var connectionCallback = null;

function graphEditor(id, width, height) {
	this.raphael = Raphael(id, width, height);
	this.raphael.rect(0, 0, width, height).attr({
			fill: '#fff',
			stroke: '#222'
		});
	this.nodes = [];
	this.selected = null;
	
	return true;
}

graphEditor.prototype.rigConnections = function(point) {
	var sthis = this;
	point.circle.mousedown(
		function(e) {
			(e.originalEvent || e).preventDefault();
			
			var circle = sthis.raphael.circle(point.circle.attr('cx'), point.circle.attr('cy'), 1);
			var line = sthis.raphael.connection(point.circle, circle, 'yellow', '#000');
			var jo = $(sthis.raphael.element);
			var mouseup = function() {
				circle.remove();
				sthis.raphael.removeConnection(line);
				connecting = null;
				connectionCallback = null;
				jo.unbind('mouseup', mouseup);
				jo.unbind('mousemove', mousemove);
			}
			jo.mouseup(mouseup);
			
			var sx = undefined, sy = undefined;
			var mousemove = function(e) {
				if(sx == undefined) {
					sx = e.pageX - 3;
					sy = e.pageY - 3;
				}
				circle.translate(e.pageX - sx, e.pageY - sy);
				sthis.raphael.connection(line);
				sx = e.pageX;
				sy = e.pageY;
			}
			jo.mousemove(mousemove);
			
			connecting = point;
			connectionCallback = function(cpoint) {
				if(cpoint.dir != point.dir && cpoint.parent != point.parent)
					point.connect(sthis.raphael, cpoint);
			}
		}
	);
	point.circle.mouseup(
		function(e) {
			if(connecting == null) return;
			
			connectionCallback(point);
		}
	);
};

graphEditor.prototype.addNode = function(x, y, node) {
	var sthis = this;
	this.nodes.push(node);
	
	node.parent = this;
	node.focus(
		function(node) {
			if(sthis.selected != null)
				sthis.selected.blur();
			sthis.selected = node;
			node.element.toFront();
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
		point.circle = circle = this.raphael.circle(x+7.5, ly, 5).attr({stroke: '#000', fill: '#ddd'}).toFront();
		this.rigConnections(point);
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
		label = this.raphael.text(lx, ly, point.label).attr({fill: '#000', 'font-size': 12}).xlateText().toFront()
		label.point = point;
		bbox = label.getBBox();
		ly += bbox.height + 5;
		if(bbox.width > mx)
			mx = bbox.width;
		labels.push(label);
	}
	ly = y+35;
	ex = lx + mx + 10;
	for(i in labels) {
		var label = labels[i];
		label.point.circle = circle = this.raphael.circle(ex, ly, 5).attr({stroke: '#000', fill: '#ddd'}).toFront();
		this.rigConnections(label.point);
		bbox = label.getBBox();
		ly += bbox.height + 5;
		temp.push(circle);
		temp.push(label);
	}
	
	rect = this.raphael.rect(x, y, ex+10 - x, Math.max(my, ly) - y, 10).attr({fill: '#eee'});
	var set = node.element = this.raphael.set().push(
		rect, 
		this.raphael.text(x+20, y+15, node.title).attr({fill: '#000', 'font-size': 16, 'font-weight': 'bold'})
	);
	for(i in temp)
		set.push(temp[i].toFront());
	
	var suppressSelect = false;
	rect.click(
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
		set.toFront();
		for(i in node.points)
			node.points[i].fixConnections(sthis.raphael);
		sthis.raphael.safari();
	}
	function end() {
		set.animate({'fill-opacity': 1}, 250);
		if(this.moved != false)
			suppressSelect = true;
	}
	rect.drag(move, start, end);
};

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
	this.points.push(new point(this, label, dir));
	return this;
};

graphNode.prototype.focus = function(hook) {
	if(hook == undefined) {
		this.selected = true;
		for(hook in this.focusHooks)
			this.focusHooks[hook](this);
	} else
		this.focusHooks.push(hook);
};

graphNode.prototype.blur = function(hook) {
	if(hook == undefined) {
		this.selected = false;
		for(hook in this.blurHooks)
			this.blurHooks[hook](this);
	} else
		this.blurHooks.push(hook);
};

function point(parent, label, dir) {
	this.parent = parent;
	this.label = label;
	this.dir = dir;
	
	this.connections = [];
	this.lines = []
	
	return true;
}

point.prototype.connect = function(raphael, other, sub) {
	this.connections.push(other);
	if(sub !== true) {
		other.connect(raphael, this, true);
		line = raphael.connection(this.circle, other.circle, '#000', '#006');
		this.lines.push(line);
		other.lines.push(line);
	}
};

point.prototype.fixConnections = function(raphael) {
	for(var i in this.lines)
		raphael.connection(this.lines[i]);
	raphael.safari();
}
