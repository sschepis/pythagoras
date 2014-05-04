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
            delete oscillators[sfreq];
        }
        return false;
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

var destroyOscillators = function() {
    var k = Object.keys(oscillators);
    for(var i=0;i<k.length;i++) {
        oscillators[k[i]].oscillator.disconnect();
        delete oscillators[k[i]];
    }
};