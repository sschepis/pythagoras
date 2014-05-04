var context = new webkitAudioContext();
var oscillators = {};

var getOscillator = function(freq, phase, play) {
    var oscillator = context.createOscillator();
    oscillator.type = 0;

    var real = new Float32Array(4096);
    var imag = new Float32Array(4096);

    var a1 = 0.0;
    var b1 = 1.0;

    var shift = 2 * Math.PI * phase; // Shift the waveform 50%
    real[1] = a1 * Math.cos(shift) - b1 * Math.sin(shift);
    imag[1] = a1 * Math.sin(shift) + b1 * Math.cos(shift);
    var wt = context.createWaveTable(real, imag);

    oscillator.frequency.value = freq;
    oscillator.setWaveTable(wt);

    if(play) {
        oscillator.connect(context.destination);
        oscillator.noteOn && oscillator.noteOn(0);
    }
    return oscillator;
};

var toggleOscillator = function(freq, phase) {
    var sfreq = (freq * 100) + '';
    if(sfreq in oscillators) {
        var oscillator = oscillators[sfreq];
        if(oscillator.noteOn === true) {
            oscillator.oscillator.disconnect();
            oscillator.noteOn = false;
            return false;
        } else {
            getAndStoreOscillator(freq, phase, true);
            return true;
        }
    } 
    else {
        getAndStoreOscillator(freq, phase, true);
        return true;
    }
};

var getAndStoreOscillator = function(freq, phase, play) {
    var sfreq = (freq * 100) + '';
    var oscillator = {
        type : 0,
        frequency : freq,
        noteOn : play,
        oscillator : getOscillator(freq, phase, play)
    };
    oscillators[sfreq] = oscillator;
    return oscillator;
}

var destroyOscillators = function() {
    var k = Object.keys(oscillators);
    for(var i=0;i<k.length;i++) {
        oscillators[k[i]].oscillator.disconnect();
    }
};