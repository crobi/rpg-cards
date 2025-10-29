// Measure Unit and Number parts
function UnitValue(v, m) {
    const re = /^(\d+)(?:\.\d+)?(mm|in)$/;
    const allowedMU = ['mm', 'in'];
    let value, mu;
    if (!m) {
        value = parseFloat(v);
        [, , mu] = v.match(re) || [];
    } else {
        value = v;
        mu = m;
    }
    if (!allowedMU.includes(mu)) {
        [, , mu] = card_options['card_width'].match(re) || [];
        if (!allowedMU.includes(mu)) {
            mu = 'mm';
        }
    }
    if (Number.isNaN(value)) {
      value = 0;
    }
    this.value = value;
    this.mu = mu;
    return this;
}

UnitValue.prototype.toString = function () {
    return new BigNumber(this.value).toFixed(2).replace(/\.?0+$/, '') + this.mu;
}

function getOrientation(cssWidth, cssHeight) {
    var orientation = "";
    var width = new UnitValue(cssWidth);
    var height = new UnitValue(cssHeight);
    orientation = width.value > height.value ? 'landscape' : 'portrait'; 
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

function insertTextAtCursor(textarea, text) {
  textarea.focus();

  const value = textarea.value;
  const selStart = textarea.selectionStart;
  const selEnd = textarea.selectionEnd;

  const before = value.slice(0, selStart);
  const after = value.slice(selEnd);

  const lineStart = value.lastIndexOf('\n', selStart - 1) + 1;
  const lineEndIndex = value.indexOf('\n', selEnd);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;

  const isAtLineStart = selStart === lineStart;
  const isAtLineEnd = selEnd === lineEnd;

  let toInsert = '';

  if (isAtLineStart) {
    // Case: at beginning of line
    toInsert = text + '\n';
  } else if (isAtLineEnd) {
    // Case: at end of line
    toInsert = '\n' + text;
  } else {
    // Case: in middle of line
    toInsert = '\n' + text + '\n';
  }

  // Special rule: if user selected text and selection ends at end of line, avoid extra '\n' at end
  if (selStart !== selEnd && isAtLineEnd) {
    toInsert = '\n' + text;
  }

  insertTextWithUndo(textarea, toInsert, selStart, selEnd);
}

// Uses execCommand to ensure undo support
function insertTextWithUndo(textarea, text, start, end) {
  textarea.setSelectionRange(start, end);
  textarea.focus();

  const success = document.execCommand('insertText', false, text);

  if (!success) {
    // Fallback: manual insert (no undo)
    const value = textarea.value;
    textarea.value = value.slice(0, start) + text + value.slice(end);
    const newPos = start + text.length;
    textarea.selectionStart = textarea.selectionEnd = newPos;
  }
}

function isNil(q) {
  return q === null || q === undefined;
}