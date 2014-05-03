var context = new webkitAudioContext();
var oscillators = {};

var getOscillator = function(freq, play) {
    var oscillator = context.createOscillator();
    oscillator.type = 0;
    oscillator.frequency.value = freq;
    if(play) {
        oscillator.connect(context.destination);
        oscillator.noteOn && oscillator.noteOn(0);
    }
    return oscillator;
};

var toggleOscillator = function(freq) {
    var sfreq = (freq * 10) + '';
    if(sfreq in oscillators) {
        var o = oscillators[sfreq];
        if(o.noteOn === true) {
            o.oscillator.disconnect();
        } else {
            o.oscillator.connect(context.destination);
            o.oscillator.noteOn && o.oscillator.noteOn(0); 
        }
        oscillators[sfreq].noteOn = !oscillators[sfreq].noteOn;
        return oscillators[sfreq].noteOn;
    } 
    else {
        var oscillator = {
            type : 0,
            frequency : freq,
            noteOn : true,
            oscillator : getOscillator(freq, true)
        };
        oscillators[sfreq] = oscillator;
        return true;
    }
};