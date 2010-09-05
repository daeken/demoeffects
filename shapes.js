abs = Math.abs;
sin = Math.sin;
cos = Math.cos;
tan = Math.tan;
atan = Math.atan;
sqrt = Math.sqrt;
PI = Math.PI;

function gear(r, a, b, slope, h) {
	points = [];
	
	a += b + slope * 2;
	b += slope;
	
	steps = 360;
	if(steps % a != 0)
		steps += a - (steps % a);
	step = PI*2 / steps;
	ang = -PI;
	for(i = 0; i <= steps; ++i, ang += step) {
		var d = r;
		var off = i % a;
		if(off < slope)
			continue;
		else if(off < b)
			d -= h;
		else if(off < slope + b)
			continue
		
		points.push([sin(ang) * d, cos(ang) * d]);
	}
	
	return points;
}

function wrapIndices(j, count) {
	if(j == 0)
		return [count - 1, j + 1];
	else if(j == count - 1)
		return [0, j - 1];
	else
		return [j - 1, j + 1];
}

function vector(x, y) {
	this[0] = this.x = x;
	this[1] = this.y = y;
}
vector.prototype.add = function(right) {
	return new vector(this.x + right.x, this.y + right.y);
};
vector.prototype.sub = function(right) {
	return new vector(this.x - right.x, this.y - right.y);
};
vector.prototype.mul = function(right) {
	return new vector(this.x * right.x, this.y * right.y);
};
vector.prototype.div = function(right) {
	return new vector(this.x / right.x, this.y / right.y);
};
vector.prototype.dot = function(right) {
	return this.x*right.x + this.y*right.y;
};

function pointsToVectors(points) {
	var vectors = [];
	for(var i in points) {
		var point = points[i];
		vectors.unshift(new vector(point[0], point[1]));
	}
	return vectors;
}

function pointInTriangle(n1, n2, n3, d1, d2, d3, p) {
	return (p.dot(n1) - d1) < 0 && (p.dot(n2) - d2) < 0 && (p.dot(n3) - d3) < 0;
}

function tesselate(points, result) {
	result = result == undefined ? [] : result;
	if(points[0][0] == points[0].x)
		var hull = points;
	else
		var hull = pointsToVectors(points);
	if(hull.length < 3)
		return result;
	var convex = [];
	
	for(var j = 0; j < hull.length; ++j) {
		var i, k, t = wrapIndices(j, hull.length);
		i = t[0], k = t[1];
		
		edge = hull[i].sub(hull[k]);
		
		var n = new vector(-edge.y, edge.x);
		var d = hull[i].dot(n);
		var inside = n.dot(hull[j]) - d;
		if(inside > 0)
			convex.push(j);
	}
	
	if(convex.length == 0)
		return result;
	
	for(var i in convex) {
		var j = convex[i];
		var i, k, t = wrapIndices(j, hull.length);
		i = t[0], k = t[1];
		
		var edge0 = hull[i].sub(hull[j]);
		var edge1 = hull[j].sub(hull[k]);
		var edge2 = hull[k].sub(hull[i]);
		
		var n0 = new vector(-edge0.y, edge0.x);
		var n1 = new vector(-edge1.y, edge1.x);
		var n2 = new vector(-edge2.y, edge2.x);
		
		var d0 = n0.dot(hull[i]);
		var d1 = n1.dot(hull[j]);
		var d2 = n2.dot(hull[k]);
		
		var inside = false;
		for(var m = 0; inside == false && m < hull.length; ++m) {
			if(m == i || m == j || m == k)
				continue;
			if(pointInTriangle(n0, n1, n2, d0, d1, d2, hull[m]))
				inside = true;
		}
		
		if(!inside) {
			result.push([hull[i], hull[j], hull[k]]);
			hull.splice(j, 1);
			break;
		}
	}
	
	if(hull.length > 2)
		return tesselate(hull, result);
	else
		return result;
}

function pointsToPath(points) {
	var path = '';
	for(var i in points) {
		var point = points[i];
		path += i == 0 ? ' M ' : 'L ';
		path += point[0] + ' ' + point[1];
	}
	path += ' z';
	return raphael.path(path);
}

function localizedTranslate(x, y) {
	this.ox += x;
	this.oy += y;
	return this.origTranslate(x, y);
}
function localizedRotate(degrees, absolute) {
	this.rotation += degrees;
	for(var i in this.items) {
		var item = this.items[i];
		item.rotate(this.rotation, this.ox, this.oy);
	}
	
	return this;
}

Raphael.fn.localizedSet = function() {
	var set = this.set();
	set.rotation = 0;
	set.ox = set.oy = 0;
	set.rotate = localizedRotate;
	set.origTranslate = set.translate;
	set.translate = localizedTranslate;
	return set;
}

function pointsToTris(points) {
	var tris = tesselate(points);
	var set = raphael.localizedSet();
	
	console.log(tris.length);
	for(var i in tris) {
		set.push(pointsToPath(tris[i]));
	}
	
	return set;
}

var raphael;
var objects = null;
function frame() {
	objects.rotate(1);
}

$(document).ready(function() {
	raphael = Raphael(0, 0, 640, 480);
	var gear1 = gear(50, 10, 10, 2, 10);
	objects = raphael.set().push(
		pointsToPath(gear1).translate(100, 100), 
		pointsToTris(gear1).translate(300, 100), 
		pointsToTris(gear1).translate(300, 300).attr({fill: '#000'})
	);
	
	setInterval(frame, 1000 / 60);
});
