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
	x += 256;
	y += 256;
	if(x < 0 || x >= 512 || y < 0 || y >= 512)
		return;
	ctx.beginPath();
	//while(r > 1) {
	ctx.arc(x, y, r, 0, Math.PI*2, true);
	//	r >>= 1;
	//}
	ctx.stroke();
}

function clear() {
	ctx.clearRect(0, 0, cvs.width, cvs.height);
}

var step = 450;

function blur() {
	cd = ctx.getImageData(0, 0, 512, 512);
	e = 512 * 512 * 4;
	for(var i = 0; i < e; i += 4) {
		cd.data[i+2] += 24;
		cd.data[i+3] >>= 1;
	}
	ctx.putImageData(cd, 0, 0);
}

function frame() {
	blur();
	
	ts = cos(degrad((step * 0.1) % 360));
	for(a = 0; a < 360; a += 5) {
		rad = degrad(a);
		crad = cos(rad)+32;
		for(r = 32; r <= 224; r += 32, crad += 32) {
			circle(sin(rad + ts*r)*r, crad, 16);
		}
	}
	
	step++;
	
	loop();
}

function loop() {
	setTimeout(frame, 1000 / 60);
}

loop()
