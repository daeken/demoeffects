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

function gear(x, y, r, a, b, h, rot) {
	ctx.beginPath();
	
	for(i = 0; i <= 360; ++i) {
		ang = degrad(i);
		s = sin(ang);
		c = cos(ang);
		
		d = r;
		if(((i + rot) % a) < b)
			d -= h;
		
		ctx.lineTo(x + s * d, y + c * d);
	}
	
	ctx.stroke();
}

function frame() {
	clear();
	
	gear(256, 256, 50, 15, 8, 8, rotation);
	gear(200, 180, 50, 15, 9, 9, 360-rotation);
	rotation = (rotation + 1) % 360;
	loop();
}

function loop() {
	setTimeout(frame, 1000 / 60);
}

loop()
