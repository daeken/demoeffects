i = new Image();
archive = [];
i.onload = function() {
	c = document.getElementById('p').getContext('2d');
	c.drawImage(i, 0, 0);
	d = c.getImageData(0, 0, %complen%, 1).data;
	o = 4;
	for(i = 0; i < d[0]; ++i) {
		s = '';
		e = (d[o]<<8)|d[o+4];
		o += 8;
		for(j = 0; j < e; ++j, o += 4)
			s += String.fromCharCode(d[o]);
		archive[i] = s;
	}
	console.log(archive[0]);
	eval(archive[0]);
};
i.src = 'data.png'