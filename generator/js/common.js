function parseNumberAndUnit(value) {
    var re = /\d+(\.\d{1,2})?/;
    var matches = String(value).match(re);
    if (!matches) return null;
    var number = matches[0];
    var mu = value.slice(number.length);
    return { number: Number(number), mu: mu };
}

function getOrientation(cssWidth, cssHeight) {
    var orientation = "";
    var widthMatches = parseNumberAndUnit(cssWidth);
    var heightMatches = parseNumberAndUnit(cssHeight);
    if (widthMatches && heightMatches) {
        var width = widthMatches.number;
        var height = heightMatches.number;
        orientation = width > height ? 'landscape' : 'portrait'; 
    }
    return orientation;
}

function isLandscape(cssWidth, cssHeight) {
    return getOrientation(cssWidth, cssHeight) === 'landscape';
}

function forEachMatch(regexp, str, func){

    var m, i;

    while ((m = regexp.exec(str)) !== null) {
        i = m.index;
        if (i === regexp.lastIndex) regexp.lastIndex++; // avoid infinite loops with zero-width matches
        func(m, m.index);
    }

}