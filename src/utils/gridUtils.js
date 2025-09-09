import { DEFAULT_GRID_UNIT } from "@config";

export const pretty = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

export function normaliseTemplate(s) {
    return String(s || '')
        .replace(/\s+/g, ' ')
        .replace(/\s*\(\s*/g, '(')
        .replace(/\s*\)\s*/g, ')')
        .replace(/\s*,\s*/g, ',')
        .trim()
        .toLowerCase();
}

// Split at top-level spaces only (ignores spaces inside parentheses).
export function splitTopLevel(input) {
    const strings = String(input || '').trim();
    if (!strings) return [];
    let parentheses = 0, bracket = 0;
    let buffer = '';
    const output = [];
    for (let i = 0; i < strings.length; i++) {
        const character = strings[i];
        if (character === '(') { parentheses++; buffer += character; continue; }
        if (character === ')') { parentheses = Math.max(0, parentheses - 1); buffer += character; continue; }
        if (character === '[') { bracket++; buffer += character; continue; }
        if (character === ']') { bracket = Math.max(0, bracket - 1); buffer += character; continue; }
        if (character === ' ' && parentheses === 0 && bracket === 0) {
            if (buffer) { output.push(buffer); buffer = ''; }
            continue;
        }
        buffer += character;
    }
    if (buffer) output.push(buffer);
    return output;   
}

export function parseRepeat(template) {
    if(!template) return null;
    const m = template.match(/^repeat\(\s*(\d+)\s*,\s*([^)]+)\s*\)$/i);
    if (!m) return null;
    return { count: parseInt(m[1], 10), unit: m[2].trim() };
}

export function makeRepeat(count, unit = DEFAULT_GRID_UNIT) {
    return count > 0 ? `repeat(${count}, ${unit})` : null;
}

const SIMPLE_TOKEN_RE = /^(?:[0-9.]+(?:px|rem|em|ch|vh|vw|vmin|vmax|fr|%)|auto|max-content|min-content|fit-content\([^)]+\)|minmax\([^)]+\)|clamp\([^)]+\)|var\([^)]+\))$/i;

export function extendTrackTemplate(template, targetCount, fill = '1fr') {
    const safeTarget = Math.max(0, Number(targetCount) || 0);
    const current = String(template || '').trim();

    // Nothing to do
    if (safeTarget <= 0) return current;

    const { count } = countTracks(current);

    // Indeterminate or empty templates: replace with a clean repeat()
    if (count === 0) {
        const unit = (String(fill || '').trim()) || '1fr';
        return `repeat(${safeTarget}, ${unit})`;
    }

    // Already at or above target - leave as-is
    if (count >= safeTarget) return current;

    const delta = safeTarget - count;
    const unit = (String(fill || '').trim()) || '1fr';

    // If template is simple repeat(n, X) where X is a single simple token - rewrite as repeat(target, X)
    const m = current.match(/^repeat\(\s*([0-9]+)\s*,\s*([^)]+)\)\s*$/i);
    if (m) {
        const inner = m[2].trim();
        if (SIMPLE_TOKEN_RE.test(inner)) {
            return `repeat(${safeTarget}, ${inner})`;
        }
    }

    // Otherwise append delta units
    const additions = Array.from({ length: delta }).map(() => unit).join(' ');
    return `${current} ${additions}`.trim();
}

export function shrinkTrackTemplate(template, targetCount) {
    if (!template || typeof template !== 'string') return '';
    const target = Math.max(0, targetCount | 0);

    // Strip line names so we only work with sizes.
    const withoutLines = template.replace(/\[[^\]]*\]/g, ' ').trim();
    if (!withoutLines) return '';

    // If template is a simple repeat(n, X) with a single size token, keep it in repeat().
    const simpleRepeat = withoutLines.match(/^repeat\(\s*([0-9]+)\s*,\s*([^)]+)\)\s*$/i);
    if (simpleRepeat) {
        //const n = parseInt(simpleRepeat[1], 10);
        const inner = simpleRepeat[2].trim();
        // If inner has no whitespace at top level, treat as a single track size.
        if (!/\s/.test(inner)) {
            if (target <= 0) return '';
            return `repeat(${target}, ${inner})`;
        }
        // For multi-token inner patterns, expand minimally, then slice.
        const expanded = expandSimpleRepeat(withoutLines);
        return sliceTrackTokens(expanded, target);
    }
    // Otherwise, slice tokens.
    return sliceTrackTokens(withoutLines, target);
}

// Helper for extendTrackTemplate (level 1)
export function countTracks(template, fallbackUnit = DEFAULT_GRID_UNIT) {
    if (!template || typeof template !== 'string') {
        return { count: 0, unit: fallbackUnit };
    }
    
    let source = template.trim();
    if (!source) return { count: 0, unit: fallbackUnit };

    // subgrid has no fixed count
    if (/^subgrid\b/i.test(source)) {
        return { count: 0, unit: fallbackUnit };
    }

    // Strip line names [foo-start] etc. they don't contribute to count
    source = source.replace(/\[[^\]]*]/g, ' ').trim();
    if (!source) return { count: 0, unit: fallbackUnit };

    // repeat(auto-fill|auto-fit, ...) is indeterminate - we still try to glean a unit from inner
    const autoRep = source.match(/repeat\(\s*auto-(fill|fit)\s*,\s*(.+)\)$/i);
    if (autoRep) {
        const inner = autoRep[2];
        return { count: 0, unit: deriveUnitFromTemplate(inner, fallbackUnit) };
    }

    // General case
    const { count, unit } = countAndUnit(source, fallbackUnit);
    return { count, unit: unit || fallbackUnit };
}

// Helper for countTracks (level 2)
function countAndUnit(source, fallbackUnit) {
    // If entire string is a repeat(n, inner)
    const repeat = parseRepeatAtStart(source);
    if (repeat) {
        const inner = repeat.inner.trim();
        // count the inner, then multiply
        const { count: innerCount, unit: innerUnit } = countAndUnit(inner, fallbackUnit);
        return {
            count: repeat.times * innerCount,
            unit: innerUnit || deriveUnitFromTemplate(inner, fallbackUnit),
        };
    }

    // Otherwise, tokenise at top level (respect parentheses)
    const tokens = tokeniseTopLevel(source);
    const count = tokens.length;

    // - If there is exactly one token, prefer that token as the unit.
    // - If multiple tokens, fall back to the first "simple" token; else use fallback.
    let unit = '';
    if (tokens.length === 1) {
        unit = normaliseUnit(tokens[0]) || fallbackUnit;
    } else {
        const simple = tokens.find(isSimpleSizeToken);
        unit = normaliseUnit(simple) || fallbackUnit;
    }

    return { count, unit };
}

// Helper for countAndUnit (level 3)
function parseRepeatAtStart(source) {
    const match = source.match(/^repeat\(\s*([0-9]+)\s*,\s*([\s\S]+)\)\s*$/i);
    if (!match) return null;
    const times = parseInt(match[1], 10);
    const inner = match[2];
    // If inner itself contains an unmatched closing paren (malformed), bail
    if (!Number.isFinite(times) || times < 0) return null;
    return { times, inner };
}

// Helper for countAndUnit (level 3)
function tokeniseTopLevel(source) {
    const tokens = [];
    let depth = 0;
    let buffer = '';

    for (let i = 0; i < source.length; i++) {
        const character = source[i];
        if (character === '(') {
            depth++;
            buffer += character;
            continue;
        }
        if (character === ')') {
            depth = Math.max(0, depth - 1);
            buffer += character;
            continue;
        }
        if (depth === 0 && /\s/.test(character)) {
            if (buffer.trim()) tokens.push(buffer.trim());
            buffer = '';
            continue;
        }
        buffer += character;
    }
    if (buffer.trim()) tokens.push(buffer.trim());
    return tokens;
}

// Helper for countAndUnit (level 3)
function deriveUnitFromTemplate(source, fallbackUnit) {
    if (!source) return fallbackUnit;

    const repeat = parseRepeatAtStart(source);
    if (repeat) {
        const innerTokens = tokeniseTopLevel(repeat.inner);
        if (innerTokens.length === 1) {
            return normaliseUnit(innerTokens[0]) || fallbackUnit;
        }
    }

    const tokens = tokeniseTopLevel(source);
    if (tokens.length === 1) {
        return normaliseUnit(tokens[0]) || fallbackUnit;
    }

    const simple = tokens.find(isSimpleSizeToken);
    return normaliseUnit(simple) || fallbackUnit;
}

// Helper for deriveUnitFromTemplate (level 4...are we going too deep here?)
function isSimpleSizeToken(token) {
    if (!token) return false;
    // Treat single top-level constructs as "simple": minmax(...), fit-content(...), clamp(...), var(...)
    if (/^(minmax|fit-content|clamp|var)\(/i.test(token)) return true;
    // Plain sizes: number+unit or fr
    if (/^[0-9.]+(px|rem|em|ch|vh|vw|vmin|vmax|fr|%)$/i.test(token)) return true;
    // Keywords like auto, max-content
    if (/^(auto|max-content|min-content)$/i.test(token)) return true;
    return false;
}

// Helper for deriveUnitFromTemplate (level 4...are we going too deep here?)
function normaliseUnit(token) {
    if (!token) return '';
    return token.trim();
}

// Helper for shrinkTrackTemplate (level 1)
function expandSimpleRepeat(template) {
    // Only expand top-level repeat(n, ...) where "..." does not contain nested repeat.
    return template.replace(/repeat\(\s*([0-9]+)\s*,\s*([^)]+)\)/gi, (_m, n, inner) => {
        const times = parseInt(n, 10);
        const unit = inner.trim();
        return Array.from({ length: times }).map(() => unit).join(' ');
    });
}

// Helper for shrinkTrackTemplate (level 1)
function sliceTrackTokens(trackList, targetCount) {
    if (targetCount <= 0) return '';
    // Split on whitespace outside parentheses
    let depth = 0, buf = '', tokens = [];
    for (const ch of trackList) {
        if (ch === '(') depth++;
        if (ch === ')') depth = Math.max(0, depth - 1);
        if (/\s/.test(ch) && depth === 0) {
            if (buf) { tokens.push(buf); buf = ''; }
        } else {
            buf += ch;
        }
    }
    if (buf) tokens.push(buf);
    const sliced = tokens.slice(0, targetCount);
    if (sliced.length === 0) return '';
    return sliced.join(' ');
}


/* decoder functions that read the value of attrs.gridTemplate{axis} and allow GridPanelPanes to read the values */
/* simple: repeat(12, 1fr)  */
export function decodeSimple(template) {
    const repeats = parseRepeat(template);
    if(!repeats) return null;

    const normalised = normaliseTemplate(makeRepeat(repeats.count, repeats.unit));
    return {
        mode: 'simple',
        template: template || null,
        normalised,
        simple: {count: repeats.count, unit: repeats.unit }
    }
}

/* tracks: [line-name-start] 300px [line-name-end]  */
export function decodeTracks(template) {
    const tokens = splitTopLevel(template);
    if(!tokens.length) return null;
    const normalised = normaliseTemplate(tokens.join(' '));
    return {
        mode: 'tracks',
        template: template || null,
        normalised,
        tracks: tokens
    }
}

/* axis: used by useGridModel  */
const DECODERS = [decodeSimple, decodeTracks];
export function decodeAxis(template) {
    const tpl = template || '';
    for(const dec of DECODERS) {
        const out = dec(tpl);
        if (out) return out;
    }
    // Fallback: unknown/raw (empty or unrecognized string)
    return {
        mode: 'raw',
        template: template || null,
        normalised: normaliseTemplate(template || '')
    }
}

// grid template areas utils

export function measureAreas(rawTemplate) {
    const template = (rawTemplate || '').trim();
    if (!template) return { hasAreas: false, cols: 0, rows: 0 };

    const rows = template
        .split(/(['"])(?:(?=(\\?))\2.)*?\1/)
        .map((chunk) => chunk.replace(/^['"]|['"]$/g, '').trim())
        .filter((row) => row && !/^[\s]+$/.test(row));
    
    if (!rows.length) return { hasAreas: false, cols: 0, rows: 0 };

    const cols = Math.max(
        0,
        ...rows.map((r) => r.split(/\s+/).filter(Boolean).length)
    );

    return { hasAreas: true, cols, rows: rows.length };
}

export function serialiseAreas(matrix, emptyToken = '.') {
    if (!Array.isArray(matrix) || matrix.length === 0) return '';
    const normalised = matrix.map((row) =>
        (Array.isArray(row) ? row : [])
            .map((cell) => {
                const value = String(cell ?? '').trim();
                return value === '' ? emptyToken : value;
            })
    );
    // If everything is '.', unset instead of setting an all-dot template
    const hasNonEmpty = normalised.some((row) => row.some((cell) => cell !== emptyToken));
    if (!hasNonEmpty) return '';

    return normalised.map((row) => `"${row.join(' ')}"`).join(' ');
}

export function parseAreas(template, emptyToken = '.') {
    const text = String(template || '').trim();
    if (!text) return [];
    
    // Split into quoted rows, tolerate both single and double quotes
    const rows = [];
        text.replace(/(['"])(.*?)\1/g, (foo, bar, row) => { rows.push(row); return ''; });
    return rows.map((row) =>
        row.trim().split(/\s+/).map((cell) => (cell && cell !== emptyToken ? cell : emptyToken))
    );
}

export function ensureSize(matrix, cols, rows, fill = '.') {
    const output = [];
    for(let x = 0; x < rows; x++) {
        const src = matrix[x] || [];
        const row = Array.from({ length: cols }, (_, y) => src[y] ?? fill);
        output.push(row);
    }
    return output;
}

/* grid item helpers */
/* which panel is the grid item settings in? */
export function whereGridItemDefined(attrs = {}) {
    const has = (value) => value !== undefined && value !== null && String(value).trim() !== '';
    const nonNumeric = (value) => has(value) && isNaN(Number(value));
    const negative   = (value) => Number(value) < 0;

    if (has(attrs.gridArea)) return 'Advanced';
    if (has(attrs.gridColumnEnd) || has(attrs.gridRowEnd)) return 'Advanced';
    if (nonNumeric(attrs.gridColumnStart) || nonNumeric(attrs.gridRowStart)) return 'Advanced';
    if (negative(attrs.gridColumnStart) || negative(attrs.gridRowStart)) return 'Advanced';
    return 'Simple';
}