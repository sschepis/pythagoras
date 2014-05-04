var multiply_n = function(val, mult, times) {
	var ret = val;
	for(var i=0;i<times;i++) ret *= mult; 
	return ret;
}

var generatePythagoreanScale = function(octaveCount, octaveDivisions, octaveBase, startOffset, callback) {
	var result = {
		root   : octaveBase,
		divisions : octaveDivisions,
		count : octaveCount,
		octaves : Array()
	};
	if(startOffset === 0) startOffset = octaveBase;
	for(var octave = 1;octave <= octaveCount; octave++) {
		var octaveRootNote = multiply_n(startOffset, octaveBase, octave);
		var nextOctaveRootNote = multiply_n(startOffset, octaveBase, octave + 1);
		var octaveStep = (nextOctaveRootNote - octaveRootNote) / octaveDivisions;
		var octout = {
			octave : octave,
			base   : octaveBase,
			divs   : octaveDivisions,
			seed   : octaveRootNote,
			step   : octaveStep,
			notes  : Array()	
		};
		for(var noteIndex = 0;noteIndex < octaveDivisions; noteIndex++) {
			var octaveNote = octaveRootNote + (octaveStep * noteIndex);
			octout.notes.push({
				value  : Math.round(octaveNote * 100) / 100,
				phase  : Math.round((noteIndex / octaveDivisions)*100)/100,
				offset : noteIndex + 1
			});
		}
		result.octaves.push(octout);
	}
	callback(null, result);
};

