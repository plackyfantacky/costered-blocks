export function clamp (n, min, max) {
    return Math.min(Math.max(n, min), max);
}

export function toInt  (value, fallback = 1) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

export function isIntToken (token) {
    if (typeof token === 'number') return Number.isInteger(token);
    const tokenString = String(token);
    return /^-?\d+$/.test(tokenString);
}

export function toSignedLine(value, fallback = 1) {
    const num = parseInt(value, 10);
    return Number.isFinite(num) && num !== 0 ? num : fallback; //0 is invalid in CSS Grid
}

export function parseSigned(value) {
    const num = parseInt(value, 10);
    return Number.isFinite(num) ? num : '';
}

export function isZeroToken(value) {
    if (typeof value === 'number') return value === 0;
    if (typeof value === 'string') return /^\s*0\s*$/.test(value);
    return false;
}

export const parsePlacementSimple = (input) => {
    // returns { start, span } from shorthand
    const value = String(input || '').trim();
    if (!value) return { start: 1, span: 1 };

    const parts = value.split('/').map((part) => part.trim());
    if (parts.length === 1) {
        // e.g. "2"
        return { start: toInt(parts[0], 1), span: 1 /* parts[0] !== 'auto' ? 1 : 1; //this part doesn't make sense */ };
    }
    const left = parts[0], right = parts[1];
    const m = /^span\s+(\d+)$/i.exec(right);
    return { start: left === 'auto' ? 1 : toInt(left, 1), span: m ? toInt(m[1], 1) : 1 };
}

export const composePlacementSimple = (start, span, collapseSpanOne = true) => {
    const outputStart = String(start).trim() || 'auto';
    const num = toInt(span, 1);
    if (collapseSpanOne && num === 1 && outputStart !== 'auto') return outputStart; // "2 / span 1" -> "2"
    return `${outputStart} / span ${num}`;
}

export const parsePlacementAdvanced = (input) => {
    const output = { start: '', span: '', end: '' };
    const value = String(input || '').trim();
    if (!value) return output;

    const parts = value.split('/').map((part) => part.trim());
    if (parts.length === 1) {
        if (/^span\s+\d+$/i.test(parts[0])) output.span = parts[0].replace(/^span\s+/i, '');
        else output.start = parts[0];
        return output;
    }
    const left = parts[0], right = parts[1];
    output.start = left || 'auto';
    const m = /^span\s+(\d+)$/i.exec(right);
    if (m) output.span = m[1];
    else output.end = right;
    return output;
}

export const composePlacementAdvanced = ({start, span, end}, {mode = 'span', collapseSpanOne = true} = {}) => {
    const outputStart = String(start || '').trim() || 'auto';
    if (mode === 'end') {
        const outputEnd = String(end || '').trim() || 'auto';
        return `${outputStart} / ${outputEnd}`;
    }
    const num = toInt(span, 1);
    if (collapseSpanOne && num === 1 && outputStart !== 'auto') return outputStart; // "2 / span 1" -> "2"
    return `${outputStart} / span ${num}`;
}

export const extractNamedLines = (template) => {
    const names = new Set();
    const regex = /\[([^\]]+)\]/g;
    let match;
    while ((match = regex.exec(String(template || ''))) !== null) {
        const chunk = match[1].trim();
        if (!chunk) continue;
        chunk.split(/\s+/).forEach((name) => names.add(name));
    }
    return Array.from(names);
}

// Detects anything that looks like a line placement shorthand
export const isGridPlacement = (value) => /\//.test(String(value || '')) || /\bspan\s+\d+\b/i.test(String(value || ''));

// Basic validity for a named grid area (<custom-ident>-ish, practical subset)
// - non-empty string
// - no whitespace or slashes or quotes
// - not a known CSS-wide keyword
export const isValidGridAreaName = (input) => {
    const value = String(input || '').trim();
    if (!value) return false;
    if (isGridPlacement(value)) return false;
    if (/[\s\/"']/.test(value)) return false;
    if (/^(auto|inherit|initial|unset|revert|revert-layer)$/i.test(value)) return false;
    return true;
};

// Normalise: return a valid name or '' (caller decides how to handle '')
export const normaliseGridAreaName = (value) => (isValidGridAreaName(value) ? String(value).trim() : '');