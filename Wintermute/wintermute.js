var cvs = document.getElementById('wintermute');
var ctx = cvs.getContext('2d');

abs = Math.abs;
sin = Math.sin;
cos = Math.cos;
tan = Math.tan;
atan = Math.atan;
sqrt = Math.sqrt;
PI = Math.PI;
function degrad(a) { return a * PI/180 }

function circle(x, y, r) {
	if(x < 0 || x >= 512 || y < 0 || y >= 512)
		return;
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI*2, true);
	ctx.stroke();
}

function clear() {
	ctx.clearRect(0, 0, cvs.width, cvs.height);
}

var step = 0;
var iter = 0.1;

function frame() {
	clear();
	
	for(a = 0; a < 360; a += 5) {
		rad = degrad(a);
		for(r = 10; r <= 100; r += 10) {
			circle(sin(rad + tan(step*0.0025)*r + step * iter) * r + 256, cos(rad) * r + 256, sqrt(r));
		}
	}
	
	step++;
	
	loop();
}

function loop() {
	setTimeout(frame, 1000 / 60);
}

loop()
