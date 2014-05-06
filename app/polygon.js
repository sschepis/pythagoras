

var regularPolygon = function(nsides, radius, mirror, astart, pstart) {
 	var result = Array();
 	var i = 0;
 	if(!pstart || !'x' in pstart || !'y' in pstart) 
 		pstart = { x : 0, y : 0 };
 	while(i < nsides) {
 		var t = 2 * Math.PI * (i / nsides) + astart;
 		var point = {
 			x : ( Math.round(Math.sin(t) * radius * 100) / 100 ) + pstart.x,
 			y : ( Math.round(Math.cos(t) * radius * 100) / 100 ) + pstart.y
 		}
 		if(mirror) point.y = -point.y;
 		result.push(point);
 		i++;
 	}
 	return result;
};

var arrayizePoints = function(points) {
	var ret = Array();
	for(var i=0;i < points.length; i++) {
		var p = points[i];
		if('x' in p && 'y' in p) {
			ret.push(p.x);
			ret.push(p.y);
		}
	}
	return ret;
};
