var interval;
function stop() {
	clearInterval(interval);
}

function emitter(x, y, speed, frequency, lifetime) {
	this.type = emitter;
	this.x = x;
	this.y = y;
	this.speed = speed;
	this.frequency = frequency;
	this.lifetime = lifetime;
}

emitter.prototype.update = function() {
	var angle = Math.random() * Math.PI * 2 - Math.PI;
	
	dx = Math.sin(angle) * this.speed;
	dy = Math.cos(angle) * this.speed;
	this.parent.add(new particle(this.x, this.y, dx, dy, this.lifetime));
};

function attractor(x, y, gravity) {
	this.type = attractor;
	this.x = x;
	this.y = y;
	this.gravity = gravity;
	for(name in this)
		console.log(name);
}

attractor.prototype.update = function() {
	var sthis = this;
	this.parent.each(
		function(elem) {
			if(elem.type != particle) return;
			
			var dx = elem.x - sthis.x;
			var dy = elem.y - sthis.y;
			var power = sthis.gravity / Math.sqrt(dx*dx + dy*dy);
			
			elem.x -= dx * power;
			elem.y -= dy * power;
			if(elem.x < sthis.x || elem.sx > 0)
				elem.sx += power;
			else
				elem.sx -= power;
			if(elem.x < sthis.y || elem.sy > 0)
				elem.sy += power;
			else
				elem.sy -= power;
		}
	);
};

function particle(x, y, sx, sy, lifetime) {
	this.type = particle;
	this.x = x;
	this.y = y;
	this.sx = sx;
	this.sy = sy;
	this.lifetime = lifetime;
}

particle.prototype.update = function() {
	this.x += this.sx;
	this.y += this.sy;
	if(this.lifetime-- == 0) {
		this.parent.remove(this);
	}
};

particle.prototype.draw = function() {
	this.parent.ctx.beginPath();
	this.parent.ctx.arc(this.x, this.y, Math.sqrt(this.lifetime), 0, Math.PI*2, true);
	this.parent.ctx.fill();
};

function particleSystem(id) {
	this.cvs = $('#' + id)[0];
	this.ctx = this.cvs.getContext('2d');
	this.time = 0;
	
	this.removed = false;
	this.elements = [];
	
	this.add(new emitter(100, 100, 2, 1, 100));
	this.add(new attractor(400, 200, 4));
	this.add(new emitter(500, 400, 5, 1, 100));
	
	var sthis = this;
	interval = setInterval(function() { sthis.loop() }, 1000 / 60);
}

particleSystem.prototype.add = function(element) {
	element.parent = this;
	this.elements.push(element);
	return this;
};

particleSystem.prototype.remove = function(element) {
	for(var i in this.elements)
		if(this.elements[i] == element) {
			this.elements.splice(i, 1);
			this.removed = true;
			break;
		}
	return this;
};

particleSystem.prototype.each = function(func) {
	if(this.elements.length == 0)
		return;
	for(var i = 0; i < this.elements.length; ++i) {
		func(this.elements[i]);
		if(this.removed) { // Faulty assumption -- assumes element removed is current one
			--i;
			this.removed = false;
		}
	}
};

particleSystem.prototype.loop = function() {
	this.each(
		function(elem) {
			if(elem.update != undefined)
				elem.update();
		}
	);
	
	this.draw();
};

particleSystem.prototype.draw = function() {
	this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
	
	this.each(
		function(elem) {
			if(elem.draw != undefined)
				elem.draw();
		}
	);
};
