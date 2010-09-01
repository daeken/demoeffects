var cvs = document.getElementById('canvas');
var ctx = cvs.getContext('2d');

abs = Math.abs;
sin = Math.sin;
cos = Math.cos;
tan = Math.tan;
atan = Math.atan;
sqrt = Math.sqrt;
PI = Math.PI;
function degrad(a) { return a * PI/180 }

function clear() {
	ctx.clearRect(0, 0, cvs.width, cvs.height);
}

var rotation = 0;

function start() {
	ctx.beginPath();
}

var fx = null, fy = null;
function point(x, y) {
	if(fx == null) {
		fx = x; fy = y;
	}
	
	ctx.lineTo(x, y);
}

function close() {
	ctx.lineTo(fx, fy);
	ctx.stroke();
	
	fx = fy = null;
}

function gear(x, y, r, a, b, slope, h, rot) {
	start();
	
	b += slope;
	
	steps = 360;
	if(steps % a != 0)
		steps += a - (steps % a);
	step = PI*2 / steps;
	ang = -PI;
	for(i = 0; i <= steps; ++i, ang += step) {
		s = sin(ang);
		c = cos(ang);
		
		d = r;
		off = (i + rot) % a;
		if(off < slope)
			continue;
		else if(off < b)
			d -= h;
		else if(off < slope + b)
			continue
		
		point(x + s * d, y + c * d);
	}
	
	close();
}

function frame() {
	clear();
	
	gear(256, 256, 50, 50, 20, 5, 20, rotation);
	rotation = (rotation + 3) % 360;
	loop();
}

function loop() {
	setTimeout(frame, 1000 / 60);
}

loop()
