function Oscilloscope(analyser,width,height) {
	this.analyser = analyser;
	this.data = new Uint8Array(analyser.frequencyBinCount);
	this.width = width;
	this.height = height;
}
var scale = 1;
var totalWindow;
var zeroCross;

Oscilloscope.prototype.draw = function (context) {
	var data = this.data;
	var quarterHeight = this.height/4;
	var scaling = this.height/(this.height);

	this.analyser.getByteTimeDomainData(data);
	var yoffset = 128;

	context.fillStyle="#000000";
	context.fillRect(0,0,this.width, this.height);
	
	context.strokeStyle = "#000000";
	context.beginPath();
	//context.moveTo(128,((256-data[0])*scaling));

	zeroCross = findFirstPositiveZeroCrossing(data, this.width);
	if (zeroCross==0)
		zeroCross=1;

	context.strokeStyle = "#1C75BC";
	
	totalWindow = data.length;
	for (var i=zeroCross, j=0; j < this.width + zeroCross && i<data.length; i++, j++) {
		var distance = ((256-data[i])*scaling);
		var angle = (4 * scale) * j;
		var x = distance * Math.cos(angle) + 256;
		var y = distance * Math.sin(angle) + 256;
		context.lineTo(x,y);
	}		
	context.stroke();
}

var MINVAL = 134;  // 128 == zero.  MINVAL is the "minimum detected signal" level.

function findFirstPositiveZeroCrossing(buf, buflen) {
  var i = 0;
  var last_zero = -1;
  var t;

  // advance until we're zero or negative
  while (i<buflen && (buf[i] > 128 ) )
    i++;

  if (i>=buflen)
    return 0;

  // advance until we're above MINVAL, keeping track of last zero.
  while (i<buflen && ((t=buf[i]) < MINVAL )) {
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

