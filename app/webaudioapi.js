var oscillators = Array();
var voices = new Array();
var audioContext = null;

// This is the "initial patch" of the ADSR settings.  YMMV.
var currentEnvA = 7;
var currentEnvD = 15;
var currentEnvS = 50;
var currentEnvR = 20;
// end initial patch

// the onscreen keyboard "ASCII-key-to-MIDI-note" conversion array
var keyboard = {
    keys : new Array(256)
};
keyboard.keys[65] = 60; // = C4 ("middle C")
keyboard.keys[87] = 61;
keyboard.keys[83] = 62;
keyboard.keys[69] = 63;
keyboard.keys[68] = 64;
keyboard.keys[70] = 65; // = F4
keyboard.keys[84] = 66;
keyboard.keys[71] = 67;
keyboard.keys[89] = 68;
keyboard.keys[72] = 69;
keyboard.keys[85] = 70;
keyboard.keys[74] = 71;
keyboard.keys[75] = 72; // = C5
keyboard.keys[79] = 73;
keyboard.keys[76] = 74;
keyboard.keys[80] = 75;
keyboard.keys[186] = 76;
keyboard.keys[222] = 77; // = F5
keyboard.keys[221] = 78;
keyboard.keys[13] = 79;
keyboard.keys[220] = 80;

var effectChain = null;
var revNode = null;
var revGain = null;
var revBypassGain = null;

var rafID;
var oscilloscope = null;
var oscCanvas = null;

function draw() {  
  if (oscilloscope && oscCanvas)
     oscilloscope.draw(oscCanvas.oscContext);
  rafID = requestAnimationFrame( draw );
}

function setupScope(canvas) {
    canvas.analyser = audioContext.createAnalyser();
    canvas.analyser.fftSize = 2048;
    oscilloscope = new Oscilloscope(canvas.analyser, 440, 440);
    return canvas;
}

function initAudio(callback) {
    try {
        audioContext = new webkitAudioContext();
    }
    catch(e) {
        alert('Web Audio API is not supported in this browser');
    }

    // set up the master effects chain for all voices to connect to.

    // connection point for all voices
    effectChain = audioContext.createGain();

    // convolver for a global reverb - just an example "global effect"
    revNode = audioContext.createGain(); // createConvolver();

    // gain for reverb
    revGain = audioContext.createGain();
    revGain.gain.value = 0.1;

    // gain for reverb bypass.  Balance between this and the previous = effect mix.
    revBypassGain = audioContext.createGain();

    // overall volume control node
    volNode = audioContext.createGain();
    volNode.gain.value = 0.5;

    effectChain.connect( revNode );
    effectChain.connect( revBypassGain );

    revNode.connect( revGain );
    revGain.connect( volNode );
    revBypassGain.connect( volNode );

    // hook it up to the "speakers"
    volNode.connect( audioContext.destination );

    // setup the scope
    oscCanvas = setupScope(document.getElementById("scopecanvas"));
    oscCanvas.oscContext = oscCanvas.getContext( '2d' );
    draw.bind ( oscCanvas )();

    //connect our volnode to the scope
    volNode.connect ( oscCanvas.analyser );

    if(callback) callback();
}

var findOscillator = function(freq) {
    for(var i=0;i<oscillators.length;i++) {
        if(oscillators[i].frequency === freq)
            return oscillators[i];
    }
    return null;
}

var getOscillator = function(freq, phase, play) {
    var oscillator = audioContext.createOscillator();
    oscillator.type = 0;
    if(false) {
        var real = new Float32Array(4096);
        var imag = new Float32Array(4096);
        var a1 = 0.0;
        var b1 = 1.0;
        var shift = 2 * Math.PI * phase; // Shift the waveform
        real[1] = a1 * Math.cos(shift) - b1 * Math.sin(shift);
        imag[1] = a1 * Math.sin(shift) + b1 * Math.cos(shift);
        var wt = audioContext.createWaveTable(real, imag);
        oscillator.setWaveTable(wt);
    }
    oscillator.frequency.value = freq;
    if(play) {
        oscillator.connect(audioContext.destination);
        oscillator.noteOn && oscillator.noteOn(0);
    }
    return oscillator;
};

var toggleOscillator = function(freq, phase) {
    var oscillator = findOscillator(freq);
    if(oscillator != null) {
        if(oscillator.noteOn === true) {
            oscillator.oscillator.disconnect();
            oscillator.noteOn = false;
            return false;
        } else {
            oscillator.oscillator.connect(audioContext.destination);
            oscillator.noteOn && oscillator.noteOn(0);
            oscillator.noteOn = true;
            return true;
        }
    } 
    else {
        getAndStoreOscillator(freq, phase, true);
        return true;
    }
};

var getAndStoreOscillator = function(freq, phase, play) {
    var oscillator = {
        type : 0,
        frequency : freq,
        noteOn : play,
        oscillator : getOscillator(freq, phase, play)
    };
    oscillators.push(oscillator);
    return oscillator;
}

var destroyOscillators = function() {
    for(var i=0;i<oscillators.length;i++) {
        oscillators[i].oscillator.disconnect();
    }
    oscillators = Array();
};

function impulseResponse( duration, decay ) {
    var sampleRate = audioContext.sampleRate;
    var length = sampleRate * duration;
    var impulse = audioContext.createBuffer(2, length, sampleRate);
    var impulseL = impulse.getChannelData(0);
    var impulseR = impulse.getChannelData(1);

    if (!decay)
        decay = 2.0;
    for (var i = 0; i < length; i++){
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
    return impulse;
}

function Voice( note, velocity, is_freq ) {
    if(is_freq) {
        this.originalFrequency = note;
        this.isRawFrequency = true;

    } else this.originalFrequency = frequencyFromNoteNumber( note );

    // create oscillator
    this.osc = audioContext.createOscillator();
    this.osc.frequency.setValueAtTime(this.originalFrequency, 0);

    // create the volume envelope
    this.envelope = audioContext.createGain();
    this.osc.connect( this.envelope );
    this.envelope.connect( effectChain );

    // set up the volume ADSR envelope
    var now = audioContext.currentTime;
    var envAttackEnd = now + (currentEnvA/10.0);

    this.envelope.gain.setValueAtTime( 0.0, now );
    this.envelope.gain.linearRampToValueAtTime( 1.0, envAttackEnd );
    this.envelope.gain.setTargetValueAtTime( 
        (currentEnvS/100.0), 
        envAttackEnd, 
        (currentEnvD/100.0)+0.001 );

    this.osc.start(0);
}

Voice.prototype.noteOff = function() {
    var now =  audioContext.currentTime;
    var release = now + (currentEnvR/10.0); 

    this.envelope.gain.cancelScheduledValues(now);
    this.envelope.gain.setValueAtTime( this.envelope.gain.value, now );  // this is necessary because of the linear ramp
    this.envelope.gain.setTargetValueAtTime(
        0.0, 
        now, 
        (currentEnvR/100));
    this.osc.stop( release );
}

function noteOn( note, velocity ) {
    if (voices[note] == null) {
        // Create a new synth node
        voices[note] = new Voice(note, velocity, false);
    }
}

function noteOff( note ) {
    if (voices[note] != null) {
        // Shut off the note playing and clear it 
        voices[note].noteOff();
        voices[note] = null;
    }
}

var toggleFreq = function(freq, velocity) {
    note = Math.round(freq * 100);
    if(voices[note] != null) {
        freqOff( freq );
        return false;
    } else {
        freqOn(freq, velocity);
        return true;
    }
};

function freqOn( freq, velocity ) {
    note = Math.round(freq * 100);
    if (voices[note] == null) {
        // Create a new synth node
        voices[note] = new Voice(freq, velocity, true);
    }
}

function freqOff( freq ) {
    note = Math.round(freq * 100);
    if (voices[note] != null) {
        // Shut off the note playing and clear it 
        voices[note].noteOff();
        voices[note] = null;
    }
}

function allOff() {
    for (var i in voices) {
        if (voices[i] && voices[i].osc)
            voices[i].noteOff();
    }
}

// 'value' is normalized to [-1,1]
function pitchWheel( value ) {
    for (var i in voices) {
        if (voices[i] && voices[i].osc)
            voices[i].osc.detune.value = value * 500;   // value in cents - detune major fifth.
    }
}

// 'value' is normalized to 0..1.
function controller( number, value ) {
    switch (number) {
        case 1:
            // do something with CC#1
            break;
        case 2:
            // do something with CC#2
            break;
    }
}

// 'value' is normalized to [-1,1]
function pitchWheel( value ) {
    for (var i in voices) {
        if (voices[i] && voices[i].osc)
            voices[i].osc.detune.value = value * 500;   // value in cents - detune major fifth.
    }
}

function frequencyFromNoteNumber( note ) {
    return 440 * Math.pow(2,(note-69)/12);
}
