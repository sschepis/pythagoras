var audioContext = null;
var myBuffer = null;
var osc = null;
var myOscilloscope = null;
var myCanvas = null;
var sampleFreq = 432;
var pwmOsc = null;
var rafID;

// shim layer with setTimeout fallback
window.requestAnimationFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame;

function draw() {  
  if (myOscilloscope)
    myOscilloscope.draw(myCanvas.myContext);
  rafID = requestAnimationFrame( draw );
}

function setupScopeCanvas( canvas ) {
  canvas.myContext = canvas.getContext( '2d' );
  return canvas;
}

function init(){
  myCanvas = setupScopeCanvas(document.getElementById("scope"));
  setupAudio( myCanvas );
  draw.bind ( myCanvas )();
}

window.addEventListener("load", init);

function xscalechange() {
  scale = document.getElementById("dutycycle").value;
  myOscilloscope.xscaling = scale;
  document.getElementById("samplesize").value = scale;
}

function gainchange() {
  gain = document.getElementById("gain").value;
  pwmOsc.output.gain.value= gain;
  document.getElementById("gaintext").value = gain;
}

function frequencychange() {
  var freqval = document.getElementById("frequency").value;
  osc.frequency.value = freqval;
  document.getElementById('freqvalue').value = freqval;
}

function freqvalchange() {
  var freqval = document.getElementById("freqvalue").value;
  osc.frequency.value = freqval;
  document.getElementById('frequency').value = freqval;
}

function start(time) {
	this.osc1.start(time);
}
function stop(time) {
	this.osc1.stop(time);
}

function createPWMOsc(freq, dutyCycle) {
	var pwm = new Object();
	osc = audioContext.createOscillator();
	var output = audioContext.createGain();

	osc.type="sine";
	osc.frequency.value=freq;
	osc.connect(output);

	output.gain.value = 0.5;

	pwm.osc1=osc;
	pwm.output=output;
	pwm.frequency = freq;

	pwm.start=start;
	pwm.stop=stop;

	return pwm;
}

function setupAudio( obj ) {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	audioContext = new AudioContext();

	obj.analyser = audioContext.createAnalyser();
	obj.analyser.fftSize = 2048;

	myOscilloscope = new Oscilloscope(obj.analyser, 512, 512);

	pwmOsc = createPWMOsc(sampleFreq, 0);

	pwmOsc.output.connect(audioContext.destination);
	pwmOsc.output.connect(obj.analyser);
	pwmOsc.start(audioContext.currentTime);
}