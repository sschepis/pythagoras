
// shim layer with setTimeout fallback
window.requestAnimationFrame = window.requestAnimationFrame       ||
  window.webkitRequestAnimationFrame;

function pushme() {
  pwmOsc.stop(0);
  //window.cancelAnimationFrame(rafID);
}
var rafID;
var myOscilloscope = null;

function draw() {  
  if (myOscilloscope)
    myOscilloscope.draw(myCanvas.myContext);

  rafID = requestAnimationFrame( draw );
}

function setupCanvas( container ) {
  var canvas = document.createElement( 'canvas' );
  canvas.width = 512; 
  canvas.height = 512; 
  canvas.myContext = canvas.getContext( '2d' );

  if (container)
    container.appendChild( canvas );
  else
    document.body.appendChild( canvas );
  return canvas;
}

function init(){
  myCanvas = setupCanvas();
  setupAudio( myCanvas );

  draw.bind(myCanvas)();
}

window.addEventListener("load", init );

function dutycyclechange() {
  scale = document.getElementById("dutycycle").value;
  document.getElementById("samplesize").value = scale;
  
}

function frequencychange() {
  var freqval = document.getElementById("frequency").value;
  osc1.frequency.value = freqval;
  document.getElementById('freqvalue').value = freqval;
}

function freqvalchange() {
  var freqval = document.getElementById("freqvalue").value;
  osc1.frequency.value = freqval;
  document.getElementById('frequency').value = freqval;
}
