var cos = Math.cos;
var sin = Math.sin;
var sqrt = Math.sqrt;
var abs = Math.abs;
var PI = Math.PI;
function sq(x) {
	return x*x;
}
function sqn(x) {
	var tx = x * x;
	if(x < 0)
		return -tx;
	return tx;
}
function distn(a, b) {
	var x = sqn(a) + sqn(b);
	if(x < 0)
		return -sqrt(-x);
	else
		return sqrt(x);
}
function hypot(a, b) {
	return sqrt(sq(a) + sq(b));
}

function matrix(a, b, c, d) {
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
	this.rotate = function(angle) {
		var rotation = matrix.rotation(angle);
		return this.mult(rotation);
	}
	this.scale = function(factor) {
		var scale = matrix.scaling(factor);
		return this.mult(scale);
	}
	this.mult = function(right) {
		return new matrix(
				this.a * right.a + this.b * right.c, 
				this.a * right.b + this.b * right.d, 
				this.c * right.a + this.d * right.c, 
				this.c * right.b + this.d * right.d
			);
	}
	this.apply = function(x, y) {
		point = [];
		point.x = this.a*x + this.b*y;
		point.y = this.c*x + this.d*y;
		return point
	}
}
matrix.identity = function() {
	return new matrix(1.0, 0.0, 0.0, 1.0);
}
matrix.rotation = function(angle) {
	var cangle = cos(angle);
	var sangle = sin(angle);
	return new matrix(cangle, -sangle, sangle, cangle);
}
matrix.scaling = function(factor) {
	return new matrix(factor, 0.0, 0.0, factor);
}

function clamp(x, max) {
	if(x < 0)
		return 0;
	else if(x >= max)
		return max;
	return x;
}

function niceCanvas(canvas) {
	this.ctx = canvas.getContext('2d');
	//canvas.setAttribute('width', 256);
	//canvas.setAttribute('height', 256);
	var width = this.width = parseInt(canvas.getAttribute('width'));
	this.height = parseInt(canvas.getAttribute('height'));
	this.hwidth = this.width / 2;
	this.hheight = this.height / 2;
	this.data = this.ctx.createImageData(this.width, this.height);
	
	this.wshift = 0;
	while((width & 1) == 0) {
		this.wshift += 1;
		width >>= 1;
	}
	this.pos = 0;
	
	this.setPos = function(x, y) {
		this.pos = ((y << this.wshift) + x) << 2;
	}
	
	this.setPixel = function(x, y, r, g, b, a) {
		if(x != -1 || y != -1) {
			if(x < 0 || x >= this.width || y < 0 || y >= this.height)
				return;
			
			this.pos = ((y << this.wshift) + x) << 2;
		}
		
		var i = this.pos;
		var data = this.data.data;
		
		if(a >= 255) {
			data[i] = r;
			data[i+1] = g;
			data[i+2] = b;
		}
		else if(a == 128) {
			data[i]   = (r >> 1) ^ (data[i] >> 1) | ((r & 1) << 7);
			data[i+1] = (g >> 1) ^ (data[i+1] >> 1) | ((g & 1) << 7);
			data[i+2] = (b >> 1) ^ (data[i+2] >> 1) | ((b & 1) << 7);
		} else {
			var ratio = a / 255.0;
			var inv = 1.0 - ratio;
			data[i]   = (r * ratio) + (data[i] * inv);
			data[i+1] = (g * ratio) + (data[i+1] * inv);
			data[i+2] = (b * ratio) + (data[i+2] * inv);
		}
		this.pos += 4;
	}
	
	this.line = function(x0, y0, x1, y1, r, g, b, a) {
		var steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
		if(steep) {
			var t = x0;
			x0 = y0;
			y0 = t;
			t = x1;
			x1 = y1;
			y1 = t;
		}
		if(x0 > x1) {
			var t = x0;
			x0 = x1;
			x1 = t;
			t = y0;
			y0 = y1;
			y1 = t;
		}
		
		var deltaX = x1 - x0;
		var deltaY = Math.abs(y1 - y0);
		var error = 0;
		var deltaErr = deltaY / deltaX;
		var yStep = (y0 < y1) ? 1 : -1;
		for(; x0 < x1; ++x0) {
			if(steep)
				this.setPixel(y0, x0, r, g, b, a);
			else
				this.setPixel(x0, y0, r, g, b, a);
			error += deltaErr;
			if(error >= 0.5) {
				y0 += yStep;
				error -= 1.0;
			}
		}
	}
	
	this.swap = function() {
		this.ctx.putImageData(this.data, 0, 0);
		//this.clear();
	}
	
	this.clear = function() {
		for(var i = 0; i < this.width * this.height * 4; i += 4) {
			this.data.data[i] = 0;
			this.data.data[i+1] = 0;
			this.data.data[i+2] = 0;
			this.data.data[i+3] = 255;
		}
	}
	
	this.clear();
}

function rotozoom() {
	this.base = true;
	this.rot = 0.0;
	this.rotfactor = -1.0/36;
	this.zoom = 1.0;
	this.factor = 0.2/16;
	this.xoff = 100;
	this.yoff = 0;
	
	this.render = function() {
		var height = canvas.height;
		var width = canvas.width;
		var hw = canvas.width / 2;
		var hh = canvas.height / 2;
		var zoom = sin(this.zoom);
		var cangle = parseInt(cos(this.rot) * zoom * 4096);
		var sangle = parseInt(sin(this.rot) * zoom * 4096);
		
		var tx = this.xoff + -hw * cangle - -hh * sangle;
		var ty = this.yoff + -hh * cangle + -hw * sangle;
		var rowsangle = sangle + cangle * width;
		var rowcangle = cangle - sangle * width;
		canvas.setPos(0, 0);
		for(var y = 0; y < height; ++y) {
			for(var x = 0; x < width; ++x) {
				if(((tx ^ ty) & 0x12000) == 0x12000)
					canvas.setPixel(-1, -1, 255, 255, 255, 255);
				else
					canvas.setPixel(-1, -1, 0, 0, 100, 255);
				tx += cangle;
				ty += sangle;
			}
			
			tx -= rowsangle;
			ty += rowcangle;
		}
		
		this.rot += this.rotfactor;
		if(this.rot <= -3.15 || this.rot >= 3.15)
			this.rotfactor = -this.rotfactor;
		this.zoom += this.factor;
		if(this.zoom >= 1.25 || this.zoom <= 0.0625)
			this.factor = -this.factor;
		this.xoff += 4096;
		this.yoff += 2048;
	}
}

function rotoxor() {
	this.base = true;
	this.rot = 0.0;
	this.rotfactor = -1.0/36;
	this.zoom = 1.0;
	this.factor = 0.2/16;
	this.xoff = 100;
	this.yoff = 0;
	
	this.render = function() {
		var height = canvas.height;
		var width = canvas.width;
		var hw = canvas.width / 2;
		var hh = canvas.height / 2;
		var zoom = sin(this.zoom);
		var cangle = parseInt(cos(this.rot) * zoom * 4096);
		var sangle = parseInt(sin(this.rot) * zoom * 4096);
		
		var tx = this.xoff + -hw * cangle - -hh * sangle;
		var ty = this.yoff + -hh * cangle + -hw * sangle;
		var rowsangle = sangle + cangle * width;
		var rowcangle = cangle - sangle * width;
		canvas.setPos(0, 0);
		for(var y = 0; y < height; ++y) {
			for(var x = 0; x < width; ++x) {
				var v = ((tx ^ ty) >> 10) & 0xFF;
				v = ((v < 128) ? v + 128 : v - 128);
				var nv = 255-v;
				canvas.setPixel(
						-1, 
						-1, 
						(((tx ^ ty) & 0x32000) == 0x32000) ? v : nv, 
						(((tx | ty) & 0x3F300) == 0x3F300) ? nv : v, 
						(((tx & ty) & 0x3C100) == 0x3C100) ? nv : v, 
						255
					);
				tx += cangle;
				ty += sangle;
			}
			
			tx -= rowsangle;
			ty += rowcangle;
		}
		
		this.rot += this.rotfactor;
		if(this.rot <= -3.15 || this.rot >= 3.15)
			this.rotfactor = -this.rotfactor;
		this.zoom += this.factor;
		if(this.zoom >= 1.25 || this.zoom <= 0.0625)
			this.factor = -this.factor;
		this.xoff += 4096;
		this.yoff += 2048;
	}
}

function rotospiral() {
	this.base = true;
	this.rot = 0.0;
	this.rotfactor = -1.0/36;
	this.zoom = 1.0;
	this.factor = 0.2/8;
	this.spin = 0.0;
	this.spinfactor = 4.0;
	
	this.render = function() {
		var hw = canvas.width / 2;
		var hh = canvas.height / 2;
		var cangle = cos(this.rot);
		var sangle = sin(this.rot);
		
		for(var y = 0; y < canvas.height; ++y) {
			var hy = y - hh;
			for(var x = 0; x < canvas.width; ++x) {
				var hx = x - hw;
				var dist = hypot(hx, hy);
				dist /= this.spin;
				dist += this.rot;
				var cd = cos(dist);
				var sd = sin(dist);
				var tx = hx * cd - hy * sd;
				var ty = hy * cd + hx * sd;
				tx = Math.abs(parseInt(tx*this.zoom));
				ty = Math.abs(parseInt(ty*this.zoom));
				if((tx + 4) % 16 > 8 && (ty + 4) % 16 > 8)
					canvas.setPixel(x, y, 255, 255, 255, 255);
				else
					canvas.setPixel(x, y, 0, 0, 100, 255);
			}
		}
		
		this.rot += this.rotfactor;
		if(this.rot <= -3.15 || this.rot >= 3.15)
			this.rotfactor = -this.rotfactor;
		this.zoom += this.factor;
		this.spin += this.spinfactor;
		if(this.spin >= 64.0 || this.spin <= -64.0)
			this.spinfactor = -this.spinfactor;
		if(this.spin == 0.0)
			this.spin += this.spinfactor;
		if(this.zoom >= 1.25 || this.zoom <= 0.125)
			this.factor = -this.factor;
	}
}

function rotoplasmaspiral() {
	this.base = true;
	this.rot = 0.0;
	this.rotfactor = -1.0/36;
	this.zoom = 1.0;
	this.factor = 0.2/8;
	this.spin = 0.0;
	this.spinfactor = 4.0;
	
	this.render = function() {
		var hw = canvas.width / 2;
		var hh = canvas.height / 2;
		var cangle = cos(this.rot);
		var sangle = sin(this.rot);
		
		for(var y = 0; y < canvas.height; ++y) {
			var hy = y - hh;
			for(var x = 0; x < canvas.width; ++x) {
				var hx = x - hw;
				var dist = distn(hx, hy) / this.spin + this.rot;
				var cd = cos(dist);
				var sd = sin(dist);
				var tx = hx * cd - hy * sd;
				var ty = hy * cd + hx * sd;
				tx = Math.abs(parseInt(tx*this.zoom));
				ty = Math.abs(parseInt(ty*this.zoom));
				if((tx + 4) % 16 > 8 && (ty + 4) % 16 > 8)
					canvas.setPixel(x, y, 255, 255, 255, 255);
				else
					canvas.setPixel(x, y, 0, 0, 100, 255);
			}
		}
		
		this.rot += this.rotfactor;
		if(this.rot <= -3.15 || this.rot >= 3.15)
			this.rotfactor = -this.rotfactor;
		this.zoom += this.factor;
		this.spin += this.spinfactor;
		if(this.spin >= 64.0 || this.spin <= -64.0)
			this.spinfactor = -this.spinfactor;
		if(this.spin == 0.0)
			this.spin += this.spinfactor;
		if(this.zoom >= 1.25 || this.zoom <= 0.125)
			this.factor = -this.factor;
	}
}

function rotofrag() {
	this.rot = 0.0;
	this.rotfactor = -1.0/18;
	this.zoom = 1.0;
	this.factor = 0.2/4;
	this.colorIndex = 0;
	this.colors = [];
	var steps = 64.0;
	for(var i = 0; i <= steps; i++) {
		var nRad = (-360 * i / steps) * (PI / 180);
		this.colors.push([
				parseInt(clamp(256 * cos(nRad))), 
				parseInt(clamp(256 * cos(nRad + 2 * PI / 3))), 
				parseInt(clamp(256 * cos(nRad + 4 * PI / 3))), 
			]);
	}
	steps = 16;
	var curR = this.colors[this.colors.length-1][0];
	var rStep = (255 - curR) / steps;
	var curG = this.colors[this.colors.length-1][1];
	var gStep = (255 - curG) / steps;
	var curB = this.colors[this.colors.length-1][2];
	var bStep = (255 - curB) / steps;
	for(var i = 0; i <= steps; i++) {
		this.colors.push([curR, curG, curB]);
		curR += rStep;
		curG += gStep;
		curB += bStep;
	}
	if(curR != 255 || curG != 255 || curB != 255) {
		curR = 255;
		curG = 255;
		curB = 255;
		this.colors.push([255, 255, 255]);
	}
	rStep = gStep = bStep = 255 / steps;
	for(var i = 0; i <= steps; i++) {
		this.colors.push([curR, curG, curB]);
		curR -= rStep;
		curG -= gStep;
		curB -= bStep;
	}
	if(curR != 0 || curG != 0 || curB != 0) {
		curR = 0;
		curG = 0;
		curB = 0;
		this.colors.push([0, 0, 0]);
	}
	var curR = 0;
	var rStep = this.colors[0][0] / steps;
	var curG = 0;
	var gStep = this.colors[0][1] / steps;
	var curB = 0;
	var bStep = this.colors[0][2] / steps;
	for(var i = 0; i < steps; i++) {
		this.colors.push([curR, curG, curB]);
		curR += rStep;
		curG += gStep;
		curB += bStep;
	}
	
	this.color = this.colors[0];
	
	this.render = function() {
		var height = canvas.height;
		var width = canvas.width;
		var hw = canvas.width / 2;
		var hh = canvas.height / 2;
		var zoom = sin(this.zoom);
		var cangle = parseInt(cos(this.rot) * zoom * 4096);
		var sangle = parseInt(sin(this.rot) * zoom * 4096);
		var r = this.color[0];
		var g = this.color[1];
		var b = this.color[2];
		
		var tx = -hw * cangle - -hh * sangle;
		var ty = -hh * cangle + -hw * sangle;
		var rowsangle = sangle + cangle * width;
		var rowcangle = cangle - sangle * width;
		for(var y = 0; y < height; ++y, tx -= rowsangle, ty += rowcangle)
			for(var x = 0; x < width; ++x, tx += cangle, ty += sangle)
				if(tx & ty & 0x8000)
					canvas.setPixel(x, y, r, g, b, 128);
		
		this.rot += this.rotfactor;
		if(this.rot <= -1.575 || this.rot >= 1.575)
			this.rotfactor = -this.rotfactor;
		this.zoom += this.factor;
		if(this.zoom >= 3.0 || this.zoom <= 0.5)
			this.factor = -this.factor;
		this.colorIndex = (this.colorIndex + 1) % this.colors.length;
		this.color = this.colors[this.colorIndex];
	}
}

function rotofragspiral() {
	this.rot = 0.0;
	this.zoom = 1.0;
	this.factor = 0.2/8;
	this.spin = 0.0;
	this.spinfactor = 4.0;
	this.color = false;
	
	this.render = function() {
		var hw = canvas.width / 2;
		var hh = canvas.height / 2;
		var cangle = cos(this.rot);
		var sangle = sin(this.rot);
		
		for(var y = 0; y < canvas.height; ++y) {
			var hy = y - hh;
			for(var x = 0; x < canvas.width; ++x) {
				var hx = x - hw;
				var dist = hypot(hx, hy);
				dist /= this.spin;
				dist += this.rot;
				var cd = cos(dist);
				var sd = sin(dist);
				var tx = hx * cd - hy * sd;
				var ty = hy * cd + hx * sd;
				tx = Math.abs(parseInt(tx*this.zoom));
				ty = Math.abs(parseInt(ty*this.zoom));
				if((tx + 4) % 16 > 8 && (ty + 4) % 16 > 8)
					if(this.color)
						canvas.setPixel(x, y, 255, 255, 255, 255);
					else
						canvas.setPixel(x, y, 0, 0, 0, 255);
			}
		}
		
		this.rot += 1.0/36;
		this.zoom += this.factor;
		this.spin += this.spinfactor;
		if(this.spin >= 64.0 || this.spin <= -64.0)
			this.spinfactor = -this.spinfactor;
		if(this.spin == 0.0)
			this.spin += this.spinfactor;
		if(this.zoom >= 1.25 || this.zoom <= 0.125)
			this.factor = -this.factor;
		this.color = !this.color;
	}
}

function plasma() {
	this.xOff = 0;
	this.yOff = 0;
	this.t = 100.0;

	this.palette = [];
	for(var i = 0; i < 256; ++i)
		this.palette.push([
				parseInt(clamp(256 * (sin(i * PI / 128)))), 
				parseInt(clamp(256 * (sin(i * PI / 128)))), 
				parseInt(clamp(256 * (cos(i * PI / 128)))) 
			]);
	
	this.render = function() {
		for(var x = 0; x < canvas.width; ++x) {
			var tx = x + this.xOff;
			for(var y = 0; y < canvas.height; ++y) {
				var ty = y + this.yOff;
				var v1 = 64 + 63 * sin(hypot(tx, ty) / 16);
				var v2 = 64 + 63 * sin(tx / (37+15*cos(ty/74))) * cos(ty / (31 + 11 * sin(tx/57)));
				var val = parseInt(clamp(v1 + v2));
				var color = this.palette[val];
				canvas.setPixel(x, y, color[0], color[1], color[2], 255);
			}
		}
		this.xOff += 10;
		this.yOff -= 15;
		this.t += 1.0;
	}
}

function metaballs() {
	this.balls = [
			[128.0, 128.0, 16.0, 0.0, 0.0, 0], 
			[128.0, 128.0, 16.0, 0.0, 0.0, 0], 
			[128.0, 128.0, 16.0, 0.0, 0.0, 0], 
			[128.0, 128.0, 16.0, 0.0, 0.0, 0], 
			[128.0, 128.0, 16.0, 0.0, 0.0, 0], 
		];
	
	this.render = function() {
		for(var x = 0; x < canvas.width; ++x) {
			for(var y = 0; y < canvas.height; ++y) {
				var sum = 0;
				for(var i in this.balls) {
					ball = this.balls[i];
					
					sum += ball[2] / sqrt(sq(x-ball[0]) + sq(y-ball[1]));
				}
				
				if(sum >= 1.5) {
					canvas.setPixel(x, y, 0, 255, 0, 255 * sum / 3.0);
				}
			}
		}
		
		for(var i in this.balls) {
			ball = this.balls[i];
			
			if(ball[5] == 0 || abs(ball[3]) <= ball[5] || abs(ball[4]) <= ball[5]) {
				ball[5] = Math.floor(Math.random()*20);
				ball[3] = 10.0 - Math.random()*20;
				ball[4] = 10.0 - Math.random()*20;
			}
			
			ball[0] += ball[3] / ball[5];
			if(ball[0] < 0) {
				ball[0] = abs(ball[0]);
				ball[3] = -ball[3];
			}
			else if(ball[0] >= 256) {
				ball[0] = 256.0 + (256.0 - ball[0]);
				ball[3] = -ball[3];
			}
			
			ball[1] += ball[4] / ball[5];
			if(ball[1] < 0) {
				ball[1] = abs(ball[1]);
				ball[4] = -ball[4];
			}
			else if(ball[1] >= 256) {
				ball[1] = 256.0 + (256.0 - ball[1]);
				ball[4] = -ball[4];
			}
			
			ball[5] -= 1;
		}
	}
}

function starfield() {
	this.stars = [];
	for(var i = 0; i < 256; ++i)
		this.stars.push([Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3]);
	this.speed = 1.2;
	
	this.render = function() {
		var hw = canvas.width / 2;
		var hh = canvas.height / 2;
		for(var i = 0; i < 256; ++i) {
			star = this.stars[i];
			
			if(star[0] > hw)
				newX = star[0] + star[2];
			else
				newX = star[0] - star[2];
			if(star[1] > hh)
				newY = star[1] + star[2];
			else
				newY = star[1] - star[2];
			
			canvas.line(
					Math.floor(star[0]), 
					Math.floor(star[1]), 
					Math.floor(newX), 
					Math.floor(newY), 
					255, 255, 255, 255
				);
			star[0] = newX;
			star[1] = newY;
			star[2] *= this.speed;
			if(star[0] < 0 || star[0] >= canvas.width || star[1] < 0 || star[1] >= canvas.height)
				this.stars[i] = [Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 3];
		}
	}
}

var count = 0;
var canvas = null;
var effects = [];
function run() {
	if(canvas == null)
		canvas = new niceCanvas(document.getElementById('demo'));
	
	for(i in effects)
		if(effects[i].type.running == true && effects[i].base == true)
			effects[i].render(canvas);
	for(i in effects)
		if(effects[i].type.running == true && effects[i].base != true)
			effects[i].render(canvas);
	
	canvas.swap();
	count += 1;
}

function fps() {
	sub = count;
	document.getElementById('status').innerHTML = count + ' FPS';
	count -= sub;
}

function toggle(effect) {
	if(!effect.running) {
		effect.running = true;
		if(!effect.obj) {
			effect.obj = eval('new ' + effect + '()');
			effect.obj.type = effect
			effects.push(effect.obj);
			if(effects.length == 1) {
				setInterval(run, 10);
				setInterval(fps, 1000);
			}
		}
	} else {
		effect.running = false;
	}
}

function sizeChanged() {
	var canvasElem = document.getElementById('demo');
	var size = parseInt(document.getElementById('size').value);
	canvasElem.width = size;
	canvasElem.height = size;
	canvas = new niceCanvas(canvasElem);
}
