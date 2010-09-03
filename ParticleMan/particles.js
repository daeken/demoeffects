function emitter(x, y, speed, frequency, lifetime) {
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

function particle(x, y, sx, sy, lifetime) {
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
		console.log(this.parent.elements.length);
		this.parent.remove(this);
		console.log(this.parent.elements.length);
	}
};

particle.prototype.draw = function() {
	this.parent.ctx.beginPath();
	this.parent.ctx.arc(this.x, this.y, this.lifetime / 2, 0, Math.PI*2, true);
	this.parent.ctx.fill();
};

function particleSystem(id) {
	this.cvs = $('#' + id)[0];
	this.ctx = this.cvs.getContext('2d');
	this.time = 0;
	
	this.removed = false;
	this.elements = [];
	
	this.add(new emitter(200, 200, 2, 1, 50));
	this.add(new emitter(400, 400, 5, 1, 20));
	
	var sthis = this;
	setInterval(function() { sthis.loop() }, 1000 / 60);
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
