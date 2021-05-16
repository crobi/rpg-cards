function parseNumberAndMeasureUnit(value) {
    var re = /\d+(\.\d{1,2})?/;
    var matches = String(value).match(re);
    if (!matches) return null;
    var number = matches[0];
    var mu = value.slice(number.length);
    return { number: Number(number), mu: mu };
}

function getOrientation(cssWidth, cssHeight) {
    var orientation = "";
    var widthMatches = parseNumberAndMeasureUnit(cssWidth);
    var heightMatches = parseNumberAndMeasureUnit(cssHeight);
    if (widthMatches && heightMatches) {
        var width = widthMatches.number;
        var height = heightMatches.number;
        orientation = width > height ? 'landscape' : 'portrait'; 
    }
    return orientation;
}

function isLandscape(width, height) {
    return getOrientation(width, height) === 'landscape';
}

function forEachMatch(regexp, str, func){
    var m = null, i = 0;
    while ((m = regexp.exec(str)) !== null) {
        if (m.index === regexp.lastIndex) regexp.lastIndex++; // avoid infinite loops with zero-width matches
        func(m, i);
        i++;
    }
}