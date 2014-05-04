$(document).ready(function() {

    var context = new webkitAudioContext(),
        oscillator = context.createOscillator();

    var updateFreq = function(freq) {
        oscillator.type = parseInt($('#comboWaveType').val(),10) ;
        oscillator.frequency.value = freq;
        oscillator.connect(context.destination);
        oscillator.noteOn && oscillator.noteOn(0); // this method doesn't seem to exist, though it's in the docs?
        $("#freqDisplay").val(freq + "Hz");
    };
        
    $("#freqSlider").bind("change",function() {
        $("#freqDisplay").val( $("#freqSlider").val() + "Hz");
        updateFreq($("#freqSlider").val());
    });
        
    $("#btnPlay").click(function() {
        updateFreq($("#freqSlider").val());
    });

    $("#btnPause").click(function() {
        // stop frequency increase (if on)
        $("#btnSlowClimb").text("Slowly Increase Frequency");
        slowClimbIncr = -1;
        
        // kill sound
        oscillator.disconnect();
    });

    $("#comboWaveType").change(function() {
        updateFreq($("#freqSlider").val());
    });
    
    var slowClimbIncr = 0;
    $("#btnSlowClimb").toggle(function() {
        $("#btnSlowClimb").text("Stop Increase Frequency");
        slowClimbIncr = $("#freqSlider").val();
        
        var increase = function() {
            if (slowClimbIncr === -1 || slowClimbIncr > 22000) {return;}
            
            if ( slowClimbIncr !== 0 && slowClimbIncr !== ( parseInt($("#freqSlider").val(),10)+1) ) {
                slowClimbIncr = $("#freqSlider").val();
            }
            
            $("#freqSlider").val(slowClimbIncr);
            updateFreq(slowClimbIncr);
            slowClimbIncr++;
            setTimeout(increase, 50);
        };
        
        $("#freqSlider").val(slowClimbIncr);
        increase();
        
    }, function() {
        $("#btnSlowClimb").text("Slowly Increase Frequency");
        slowClimbIncr = -1;
    });
});
