var audioContext = null;
var myBuffer = null;

var osc = null;
function setDutyCycle(amt) {
	//this.delay.delayTime.value = amt/this.frequency;	
	//this.dcGain.gain.value = 1.7*(0.5-amt);
}
function start(time) {
	this.osc1.start(time);
	//this.dcOffset.start(time);
}
function stop(time) {
	this.osc1.stop(time);
	//this.dcOffset.stop(time);
}

function createDCOffset() {
	var buffer=audioContext.createBuffer(1,1024,audioContext.sampleRate);
	var data = buffer.getChannelData(0);
	for (var i=0; i<1024; i++)
		data[i]=1.0;
	var bufferSource=audioContext.createBufferSource();
	bufferSource.buffer=buffer;
	bufferSource.loop=true;
	return bufferSource;
}

var osc1;

function createPWMOsc(freq, dutyCycle) {
	var pwm = new Object();
	osc1 = audioContext.createOscillator();
	// var inverter = audioContext.createGain();
	var output = audioContext.createGain();
	// var delay = audioContext.createDelay();
	// inverter.gain.value=-1;
	osc1.type="sine";
	osc1.frequency.value=freq;
	osc1.connect(output);
	// inverter.connect(delay);
	// delay.connect(output);
	// var dcOffset = createDCOffset();
	// var dcGain = audioContext.createGain();
	// dcOffset.connect(dcGain);
	// dcGain.connect(output);

	output.gain.value = 0.5;  // purely for debugging.

	pwm.osc1=osc1;
	pwm.output=output;
	// pwm.delay=delay;
	pwm.frequency = freq;
	//pwm.dcGain=dcGain;
	//pwm.dcOffset=dcOffset;
//	pwm.setDutyCycle = setDutyCycle;
	pwm.start=start;
	pwm.stop=stop;

	//pwm.setDutyCycle(dutyCycle);
	return pwm;
}

var pwmOsc;
var sampleFreq;

function setupAudio( obj ) {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	audioContext = new AudioContext();

	obj.analyser = audioContext.createAnalyser();
	obj.analyser.fftSize = 2048;

	myOscilloscope = new Oscilloscope(obj.analyser, 512, 512);

	sampleFreq = 243;
	pwmOsc=createPWMOsc(sampleFreq,0);

	pwmOsc.output.connect(audioContext.destination);
	pwmOsc.output.connect(obj.analyser);
	pwmOsc.start(audioContext.currentTime);

/*
	var request = new XMLHttpRequest();
	request.open("GET", "sounds/techno.wav", true);
	request.responseType = "arraybuffer";
	request.onload = function() {
	  audioContext.decodeAudioData( request.response, function(buffer) { 
	    	myBuffer = buffer;
	    	appendOutput( "Sound ready." );
		} );
	}
	request.send();
*/

}