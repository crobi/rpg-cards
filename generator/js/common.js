/**
 * Evaluates a mathematical expression using MathJS.
 *
 * ⚠️ Important:
 * To ensure correct unit simplification, **arrange terms so that unit cancellation happens first**.
 * MathJS may produce incorrect results if units are multiplied/divided in the wrong order.
 *
 * Example of incorrect usage:
 *   math_eval("63mm * 100 / 210mm") 
 *   // Returns: '30 mm^2' (incorrect)
 *
 * Correct usage with proper unit cancellation:
 *   math_eval("63mm / 210mm * 100") 
 *   // Returns: '30'
 *
 * @param {string} x - A string containing the expression to evaluate. Units must be compatible if used.
 * @returns {number|math.Unit} - The evaluated result, which may be a number or a MathJS unit object.
 */
function math_eval(x) {
  return math.evaluate(x);
}

/**
 * Formats a number, BigNumber, unit, or unit-like string into a concise, human-readable string.
 *
 * Features:
 * - Rounds numeric values to 2 decimal places by default.
 * - Removes unnecessary trailing zeros (e.g., `2.50` → `2.5`, `3.00` → `3`).
 * - For MathJS units, formats the numeric part while preserving the unit, removing all spaces.
 * - Handles strings containing numbers, units, or unit expressions.
 *
 * Examples:
 *   math_format(math.bignumber(2.5000))         // "2.5"
 *   math_format(3)                               // "3"
 *   math_format(math.unit('63 mm'))             // "63mm"
 *   math_format('100 cm')                        // "100cm"
 *   math_format('2.5000 kg')                     // "2.5kg"
 *
 * Notes:
 * - Uses high precision internally (precision: 20) to avoid rounding issues with units.
 * - All spaces in the formatted string are removed.
 * - Accepts numbers, MathJS BigNumber, MathJS Unit, or strings representing numbers/units.
 *
 * @param {number | math.BigNumber | math.Unit | string} x - The value to format.
 * @returns {string} A formatted string with rounded numeric part and cleaned-up units.
 */
function math_format(x) {
  const t = math.typeOf(x);

  // Helper: round numeric part and remove trailing zeros
  const roundAndTrim = (num, decimals = 2) => {
    const rounded = math.round(math.bignumber(num), decimals);
    let s = rounded.toString();
    if (s.includes('.')) s = s.replace(/\.?0+$/, '');
    return s;
  };

  if (t === 'Unit') {
    const formatted = x.format({ notation: 'fixed', precision: 20 }); // high precision to avoid rounding issues
    const match = formatted.match(/^([+-]?\d*\.?\d+)(.*)$/);
    if (match) {
      const value = roundAndTrim(match[1], 2);
      const unit = match[2];
      return `${value}${unit}`.replace(/\s+/g, ''); // remove all spaces
    }
    return formatted.replace(/\s+/g, '');
  }

  if (t === 'BigNumber' || t === 'number') {
    return roundAndTrim(x);
  }

  if (typeof x === 'string') {
    if (/[a-zA-Z]/.test(x)) {
      const unit = math.unit(x);
      const formatted = unit.format({ notation: 'fixed', precision: 20 });
      const match = formatted.match(/^([+-]?\d*\.?\d+)(.*)$/);
      if (match) {
        const value = roundAndTrim(match[1], 2);
        const unitStr = match[2];
        return `${value}${unitStr}`.replace(/\s+/g, '');
      }
      return formatted.replace(/\s+/g, '');
    } else {
      return roundAndTrim(x);
    }
  }

  return String(x).replace(/\s+/g, '');
}

function getOrientation(cssWidth, cssHeight) {
    return math.evaluate(`${cssWidth} > ${cssHeight}`) ? 'landscape' : 'portrait';
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