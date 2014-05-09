var rafID;
var oscilloscope = null;
var oscCanvas = null;

function draw() {  
  if (oscilloscope && oscCanvas)
    oscilloscope.draw(oscCanvas.myContext);
  rafID = requestAnimationFrame( draw );
}

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
            }
            out += '</tr>';
        }
        $('#'+tblid).html(out);
        callback();
    });
}

function listSimples() {
        var out = '';
        for(var i=0;i<4;i++) {
            out += '<tr>';
            for(var j=0;j<9;j++) {
                var classes = Array();
                var thenum = (i+1) * (j+1);
                var note = {
                    offset : i + 1,
                    phase : 0,
                    value : (i+1) * (j+1)
                };
                if(primeFactorList(thenum).length === 1) {
                    j--;
                    continue;
                }

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
                    + classes.join(' ') + ' t_frequencies2" id="' + freqid + '">' 
                    + value + '</td>';
                out += notetr;
                freqbag[freqid] = note;
            }
            out += '</tr>';
        }
        $('#frequencies2').html(out);
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

function toggleNote(evt) {
    var freq = freqbag[evt.target.id].value;
    var phase = freqbag[evt.target.id].phase;
    var state = toggleFreq(freq, 80);
    if(state) {
        $(evt.target).addClass('note-on');
        setTimeout(function(){
            freqbag[evt.target.id].polygons = drawPrimeFactorPolygons(freq);
        }, 10);
    }
    else {
        $(evt.target).removeClass('note-on');
        if('polygons' in freqbag[evt.target.id]) {
            for(var i=0;i<freqbag[evt.target.id].polygons.length;i++) {
                freqbag[evt.target.id].polygons[i].remove();
            }
        }
        two.update();
    }
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
    var apf = primeFactorList(is_int(value)?value:value*2);
    if(!options) options = defaultOptions;
    var primeFactors = {};
    var pow2 = 0;
    var polygons = Array();
    for(var i = 0;i < apf.length; i++) {
        var pfactorl = apf[i] + '';
        if(apf[i] === 2) {
            pow2++;
        } else {
            if(pfactorl in primeFactors) 
                primeFactors[pfactorl] = parseInt(primeFactors[pfactorl]) + 1;
            else {
                primeFactors[pfactorl] = 1;
            }
        }
    }
    var angle_div = 0;
    var opacity = 0;
    var primeFactorKeys = Object.keys(primeFactors);
    for(var i=0;i<primeFactorKeys.length;i++) {
        var pfactor = parseInt(primeFactorKeys[i]);
        var pfpow = primeFactors[primeFactorKeys[i]];
        opacity += pfpow;
    }
    opacity = 0.5;

    var drawNPolygons = function(numsides, num, size, position, options, offset) {
        var angle = (360 /  num);
        var angleOffset = offset;
        var outpolys = Array();
        var fillamt = options.fill.a;
        for(var j = 0;j < num;j++) {
            var rp = regularPolygon(prime > 21 ? 2 : prime, size, false, angleOffset, position);   
            rp = arrayizePoints(rp);
            rp.push(false);                              
            var poly = two.makePolygon.apply(two, rp);
            poly.fill = rgba(options.fill);
            poly.stroke = rgba(options.stroke);
            outpolys.push(poly);
            angleOffset += angle;
            options.fill.a -= fillamt / num*2;
        }
        return outpolys;
    }
    var rgba = function(rgba) {
        return 'rgba('+rgba.r+', '+rgba.g+', '+rgba.b+', '+rgba.a+')';
    }

    var niterations = pow2 == 0 ? 1 : multiply_n (1, 2, pow2);
    var curOpacity = opacity;

    for(var i=primeFactorKeys.length-1;i>=0;i--) {
        var prime = parseInt(primeFactorKeys[i]);
        var power = primeFactors[primeFactorKeys[i]];
        var fill = {r:51,g:255,b:102,a:curOpacity};
        if(prime===3) fill = {r:51,g:102,b:255,a:curOpacity};
        else if(prime===5) fill = {r:102,g:51,b:255,a:curOpacity};
        else if(prime===7) fill = {r:204,g:51,b:255,a:curOpacity};  
        else if(prime===11) fill = {r:255,g:51,b:204,a:curOpacity};  
        else if(prime===13) fill = {r:255,g:51,b:102,a:curOpacity};  
        var poptions = {
            fill : fill,
            stroke : fill
        };
        poptions.fill.a = 1;
        poptions.stroke.a = prime > 840 ? 0.08 : 0.16;
        poptions.stroke.a = prime < 210 ? 0.32 : poptions.stroke.a;
        poptions.stroke.a = prime > 1680 ? 0.02 : poptions.stroke.a;

        var numpolys = multiply_n(1, 2, power) * niterations;
        var respolys = drawNPolygons(
            prime, 
            numpolys, 
            200, 
            { x : 240, y : 240 }, 
            poptions, 
            0);
        polygons = polygons.concat(respolys);   
    }
    two.update(); 

    return polygons;
};

var two;
var oscilloscope;
$(document).ready(function(){
    buildScales();

    $('.rb').click(function(evt) {
        allOff();
        freqbag = {};
        buildScales();
    });

    two = initTwoSurface('rendercanvas', 480, 480);
    var circle = two.makeCircle(240, 240, 220);
    circle.stroke = '#000';
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