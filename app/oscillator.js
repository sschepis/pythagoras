var context = new webkitAudioContext();
var oscillators = Array();

var findOscillator = function(freq) {
    for(var i=0;i<oscillators.length;i++) {
        if(oscillators[i].frequency === freq)
            return oscillators[i];
    }
    return null;
}

var getOscillator = function(freq, phase, play) {
    var oscillator = context.createOscillator();
    oscillator.type = 0;
    if(window.mobilecheck()==true) {
        var real = new Float32Array(4096);
        var imag = new Float32Array(4096);
        var a1 = 0.0;
        var b1 = 1.0;
        var shift = 2 * Math.PI * phase; // Shift the waveform
        real[1] = a1 * Math.cos(shift) - b1 * Math.sin(shift);
        imag[1] = a1 * Math.sin(shift) + b1 * Math.cos(shift);
        var wt = context.createWaveTable(real, imag);
        oscillator.setWaveTable(wt);
    }
    oscillator.frequency.value = freq;
    if(play) {
        oscillator.connect(context.destination);
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
            oscillator.oscillator.connect(context.destination);
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
        oscillators[i].oscillator.noteOn = false;
    }
    oscillators = Array();
};