var freqbag = {};
function buildScale(tblid,n,s,m,o,callback) {
    generatePythagoreanScale(n,m,s,o,function(err,ret){
        var out = '';
        for(var i=0;i<ret.octaves.length;i++) {
            out += '<tr>';
            for(var j=0;j<ret.octaves[i].notes.length;j++) {
                var classes = Array();
                var note = ret.octaves[i].notes[j];
                var offset = note.offset,
                    value = note.value,
                    phase = note.phase;
                var primefactors = (offset == 1 ? Array() : primeFactorList(offset));
                if(offset == 1) primefactors.push(1);
                for(var x=0;x<primefactors.length;x++) {
                    var pf=primefactors[x];
                    if(x==0) classes.push('prime-' + pf);
                    else {
                        if(primefactors[x-1] !== pf)
                            classes.push('prime-' + pf);
                    }
                }
                var freqid =  (value * 100) + '';
                var notetr = '<td class="unselectable note ' 
                    + classes.join(' ') + ' t_' + tblid + '" id="' + freqid + '">' 
                    + value + '</td>';
                out += notetr;
                freqbag[freqid] = ret.octaves[i].notes[j];
                if(j===ret.octaves[i].notes.length-1) {
                    freqid = ret.octaves[i].notes[0].value * ret.octaves[i].base * 100;
                    var notetr = '<td class="unselectable note prime-1 t_' 
                        + tblid + '" id="' + freqid + '">' 
                        + ret.octaves[i].notes[0].value * ret.octaves[i].base + '</td>';
                    out += notetr;
                }
            }
            out += '</tr>';
        }
        $('#'+tblid).html(out);
        callback();
    });
}

function toggleNote(evt) {
    var freq = freqbag[evt.target.id].value;
    var phase = freqbag[evt.target.id].phase;
    var state = toggleOscillator(freq, 0);
    if(state) {
        $(evt.target).addClass('note-on');
        freqbag[evt.target.id].polygons = drawPrimeFactorPolygons(freq);
    }
    else {
        $(evt.target).removeClass('note-on');
        if('polygons' in freqbag[evt.target.id]) {
            for(var i=0;i<freqbag[evt.target.id].polygons.length;i++)
                freqbag[evt.target.id].polygons[i].remove();
        }
        delete oscillators[evt.target.id];
        two.update();
    }
}

function buildScales() {
    var n = parseInt($('#n').val());
    var m = parseInt($('#m').val());
    var s = parseInt($('#s').val());
    var o = parseInt($('#o').val());
    buildScale('frequencies',n,m,s,o,function() {

    n = parseInt($('#n2').val());
    m = parseInt($('#m2').val());
    s = parseInt($('#s2').val());
    o = parseInt($('#o2').val());
    buildScale('frequencies2',n,m,s,o,function() {});
    
    $('.note').click(function(evt) {
        toggleNote(evt);
        var cbid = $(evt.target).hasClass('t_frequencies') ? '#z' : '#z2';
        if(!$(cbid).attr('checked')) {
            setTimeout(function(){
                toggleNote(evt);
            }, 500);
        }
    });

    });
}

function initTwoSurface(elid, width, height) {
    var elem = document.getElementById(elid);
    var params = { width: width, height: height }; 
    var two = new Two(params).appendTo(elem);
    return two;
}

function is_int(value){ 
  if((parseFloat(value) == parseInt(value)) && !isNaN(value)){
      return true;
  } else { 
      return false;
  } 
}
var defaultOptions = {
    fill : 'rgba(200, 0, 255, 0.1)',
    stroke : '#1C75BC'
};

function drawPrimeFactorPolygons(value, options) {
    // var apf = primeFactorList(is_int(value)?value:value*2);
    // var polygons = Array();
    // if(!options) options = defaultOptions;
    // var pow = 1;
    // var pf = Array();
    // for(var i=apf.length-1;i>=0;i--) {
    //     pf.push(apf[i]);
    //     var spangle = i * (360 / pow);
    //     if((i<apf.length-1&&apf[i+1]!==apf[i])||i===0) {
    //         var pow2 = pf.length;
    //         var nsides = pf[0];
    //         pf = Array();
    //         for(var j=0;j<pow2;j++) {
    //             var sangle = j * (360 / pow2);
    //             var rp = regularPolygon(nsides, 200, sangle, { x : 240, y : 240 });   
    //             rp = arrayizePoints(rp);
    //             rp.push(false);                    
    //             var poly = two.makePolygon.apply(two, rp);
    //             poly.fill = options.fill;
    //             poly.stroke = options.stroke;
    //             polygons.push(poly);
    //         }
    //     }
    // }
    // two.update();    
    // return polygons;

    var apf = primeFactorList(is_int(value)?value:value*2);
    var polygons = Array();
    if(!options) options = defaultOptions;
    var primeFactors = {};
    var pow2 = 1;
    for(var i=0;i<apf.length;i++) {
        var pfactorl = apf[i] + '';
        if(apf[i] === 2) {
            pow2++;
        } else {
            if(primeFactors[pfactorl]) 
                primeFactors[pfactorl] = parseInt(primeFactors[pfactorl]) + 1;
            else primeFactors[pfactorl] = 1;
        }
    }
    if(pow2 != 1) pow2 = multiply_n(2,pow2);
    for(var p=0;p<pow2;p++) {
        var moffset = p == 0 ? 0 : 360 * ( ( p + 1 ) / pow );
        var primeFactorKeys = Object.keys(primeFactors);
        for(var i=0;i<primeFactorKeys.length;i++) {
            var prime = primeFactorKeys[i];
            var pow = primeFactors[primeFactorKeys[i]];
            var pangle = 360 / prime;
            for(var j=0;j<pow;j++) {
                var offset = j == 0 ? 0 : pangle / prime * j;
                var rp = regularPolygon(prime, 200, false, offset + moffset, { x : 240, y : 240 });   
                rp = arrayizePoints(rp);
                rp.push(false);                   
                var fill = 'rgba(200, 0, 255, 0.1)';
                if(parseInt(prime)===3)  fill = 'rgba(0, 200, 255, 0.1)';
                else if(parseInt(prime)===5)  fill = 'rgba(0, 255, 0, 0.1)';
                else if(parseInt(prime)===7)  fill = 'rgba(255, 200, 0, 0.1)';                 
                var poly = two.makePolygon.apply(two, rp);
                poly.fill = fill;
                poly.stroke = options.stroke;
                polygons.push(poly);
            }
        }
        two.update(); 
    }
    return polygons;
}

var two;
$(document).ready(function(){
    buildScales();

    $('.rb').click(function(evt) {
        destroyOscillators();
        freqbag = {};
        buildScales();
    });

    two = initTwoSurface('rendercanvas', 480, 480);
    var circle = two.makeCircle(240, 240, 200);
    circle.stroke = '#1C75BC';
    two.update();     
});

function getClassStyles(parentElem, selector, style){
    elemstr = '<div '+ selector +'></div>';
    var $elem = $(elemstr).hide().appendTo(parentElem);
        val = $elem.css(style);
    $elem.remove();
    return val;
}
//val = getClassStyles('.container:first', 'class="title"', 'margin-top');

function getStyleSheetPropertyValue(selectorText, propertyName) {
    // search backwards because the last match is more likely the right one
    for (var s= document.styleSheets.length - 1; s >= 0; s--) {
        var cssRules = document.styleSheets[s].cssRules ||
                document.styleSheets[s].rules || []; // IE support
        for (var c=0; c < cssRules.length; c++) {
            if (cssRules[c].selectorText === selectorText) 
                return cssRules[c].style[propertyName];
        }
    }
    return null;
}

window.mobilecheck = function() {
var check = false;
(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
return check; }