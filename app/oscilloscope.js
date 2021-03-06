function Oscilloscope(analyser, width, height) {
	this.analyser = analyser;
	this.data = new Uint8Array(analyser.frequencyBinCount);
	this.width = width;
	this.height = height;
	this.xscaling = 0.325;
	this.yscaling = 1;
	this.minval = (this.height/4) + 6;
	this.totalWindow = 0;
	this.zeroCross = 0;
	this.enabled = true;
}

Oscilloscope.prototype.findFirstPositiveZeroCrossing = function(buf, buflen) {
  var i = 0;
  var last_zero = -1;
  var t;
  // advance until we're zero or negative
  while (i<buflen && (buf[i] > 128 ))
    i++;
  if (i>=buflen) return 0;
  // advance until we're above MINVAL, keeping track of last zero.
  while (i<buflen && ((t=buf[i]) < this.minval)) {
    if (t >= 128) {
      if (last_zero == -1)
        last_zero = i;
    } else last_zero = -1;
    i++;
  }
  // we may have jumped over MINVAL in one sample.
  if (last_zero == -1) last_zero = i;
	// We didn't find any positive zero crossings
  if (i==buflen) return 0;
  // The first sample might be a zero.  If so, return it.
  if (last_zero == 0) return 0;
  return last_zero;
}

Oscilloscope.prototype.draw = function (context) {
	var data = this.data;
	var halfHeight = this.height/2;
	var quarterHeight = this.height/4;

	this.analyser.getByteTimeDomainData(data);

	context.strokeStyle = "#000000";
	context.fillStyle="#000000";
	context.fillRect(0,0, this.width, this.height);	

	if(!this.enabled) return context.stroke();

	context.beginPath();

	this.zeroCross = this.findFirstPositiveZeroCrossing(data, this.width);
	if (this.zeroCross==0)
		this.zeroCross=1;

	context.strokeStyle = "#3366FF";

	this.totalWindow = data.length;
	for (var i=this.zeroCross, j=0; j < this.width + this.zeroCross && i<data.length; i++, j++) {
		var distance = ((halfHeight - data[i]) * this.yscaling);
		var angle = (4 * this.xscaling) * j;
		var x = distance * Math.cos(angle) + halfHeight;
		var y = distance * Math.sin(angle) + halfHeight - (quarterHeight/3);
		context.lineTo(x,y);
	}		

	var lScopeOriginX = quarterHeight - (quarterHeight / 4);
	var lScopeOriginY = this.height - quarterHeight;
	var lScopeCenterY = lScopeOriginY + 48;

	context.moveTo(lScopeOriginX, lScopeCenterY);
	var ly = lScopeCenterY;
	for (var i=this.zeroCross, j=0; j < (this.width-lScopeOriginX*2)  + this.zeroCross && i<data.length; i++, j++) {
		var lx = (j*this.xscaling)+lScopeOriginX;
		if(lx > this.width-lScopeOriginX) {
			while(lx > this.width-lScopeOriginX)
				lx -= this.width-lScopeOriginX*2;
			context.moveTo(lx,ly);
		}
		ly = ((256-data[i])*(1/(128/48))) + lScopeOriginY;
		context.lineTo(lx,ly);
	}

	context.stroke();
}

