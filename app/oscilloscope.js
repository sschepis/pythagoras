function Oscilloscope(analyser, width, height) {
	this.analyser = analyser;
	this.data = new Uint8Array(analyser.frequencyBinCount);
	this.width = width;
	this.height = height;
	this.xscaling = 1;
	this.yscaling = 1;
	this.minval = (this.height/4) + 8;
	this.totalWindow = 0;
	this.zeroCross = 0;
}

Oscilloscope.prototype.findFirstPositiveZeroCrossing = function(buf, buflen) {
  var i = 0;
  var last_zero = -1;
  var t;

  // advance until we're zero or negative
  while (i<buflen && (buf[i] > 128 ) )
    i++;

  if (i>=buflen)
    return 0;

  // advance until we're above MINVAL, keeping track of last zero.
  while (i<buflen && ((t=buf[i]) < this.minval )) {
    if (t >= 128) {
      if (last_zero == -1)
        last_zero = i;
    } else
      last_zero = -1;
    i++;
  }

  // we may have jumped over MINVAL in one sample.
  if (last_zero == -1)
    last_zero = i;

  if (i==buflen)  // We didn't find any positive zero crossings
    return 0;

  // The first sample might be a zero.  If so, return it.
  if (last_zero == 0)
    return 0;

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

	context.beginPath();

	this.zeroCross = this.findFirstPositiveZeroCrossing(data, this.width);
	if (this.zeroCross==0)
		this.zeroCross=1;

	context.strokeStyle = "#1C75BC";
	
	this.totalWindow = data.length;
	for (var i=this.zeroCross, j=0; j < this.width + this.zeroCross && i<data.length; i++, j++) {
		var distance = ((halfHeight - data[i]) * this.yscaling);
		var angle = (4 * this.xscaling) * j;
		var x = distance * Math.cos(angle) + halfHeight;
		var y = distance * Math.sin(angle) + halfHeight;
		context.lineTo(x,y);
	}		
	context.stroke();
}

