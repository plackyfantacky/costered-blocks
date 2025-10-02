import { DEFAULT_GRID_UNIT } from "@config";

/** Capitalise the first character of a string. */
export const pretty = (s: unknown): string => 
    s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : '';

 /**
  * Normalise a grid template string:
  * - collapse whitespace, trim parentheses and comma spacing, lowercase.
  *
  * @param {string} input
  * @returns {string}
  */
export function normaliseTemplate(input: unknown): string {
    return String(input || '')
        .replace(/\s+/g, ' ')
        .replace(/\s*\(\s*/g, '(')
        .replace(/\s*\)\s*/g, ')')
        .replace(/\s*,\s*/g, ',')
        .trim()
        .toLowerCase();
}

/**
 * Split a string by top-level spaces, ignoring spaces inside () and [].
 * Example: "minmax(100px, 1fr) 2fr [name]" -> ["minmax(100px,1fr)", "2fr", "[name]"]
 *
 * @param {string} input
 * @returns {string[]}
 */
export function splitTopLevel(input: unknown): string[] {
    const source = String(input ?? '').trim();
    if (!source) return [];
  
    let braces = 0;
    let bracket = 0;
    let buffer = '';

    const output: string[] = [];
    for (let i = 0; i < source.length; i++) {
        const character = source[i];
        if (character === '(') { braces++; buffer += character; continue; }
        if (character === ')') { braces = Math.max(0, braces - 1); buffer += character; continue; }
        if (character === '[') { bracket++; buffer += character; continue; }
        if (character === ']') { bracket = Math.max(0, bracket - 1); buffer += character; continue; }
        if (character === ' ' && braces === 0 && bracket === 0) {
            if (buffer) { output.push(buffer); buffer = ''; }
            continue;
        }
        buffer += character;
    }
    if (buffer) output.push(buffer);
    return output;   
}


/* ------------------------------ repeat(...) utils ------------------------------ */

export type RepeatInfo = { count: number, unit: string };

/**
 * Parse a simple "repeat(N, X)" expression.
 *
 * @param {string} template
 * @returns {{count:number, unit:string}|null}
 */
export function parseRepeat(template: unknown): RepeatInfo | null {
    const temp = String(template ?? '').trim();
    if (!temp) return null;
    // Only matches simple repeat(n, X) where n is a non-negative integer and X is any string (including nested parens)

    const match = temp.match(/^repeat\(\s*(\d+)\s*,\s*([^)]+)\s*\)$/i);
    if (!match || match[1] === undefined|| match[2] === undefined) return null;

    const count = Number.parseInt(match[1], 10);
    const unit = match[2].trim();
    if (!Number.isFinite(count) || count < 0 || unit === '') return null;

    return { count, unit };
}


/**
 * Build a simple "repeat(N, X)" expression.
 *
 * @param {number} count
 * @param {string} [unit=DEFAULT_GRID_UNIT]
 * @returns {string|null}
 */
export function makeRepeat(count: number, unit: string = DEFAULT_GRID_UNIT): string | null {
    return count > 0 ? `repeat(${count}, ${unit})` : null;
}

const SIMPLE_TOKEN_RE = /^(?:[0-9.]+(?:px|rem|em|ch|vh|vw|vmin|vmax|fr|%)|auto|max-content|min-content|fit-content\([^)]+\)|minmax\([^)]+\)|clamp\([^)]+\)|var\([^)]+\))$/i;


/**
 * Ensure a template has at least `targetCount` tracks by extending it.
 * - If the template is empty or indeterminate, returns `repeat(target, fill)`.
 * - If the template is `repeat(n, X)` with simple X, rewrites to `repeat(target, X)`.
 * - Otherwise appends `fill` tokens to reach the target.
 *
 * @param {string} template
 * @param {number} targetCount
 * @param {string} [fill='1fr']
 * @returns {string}
 */
export function extendTrackTemplate(
    template: unknown,
    targetCount: unknown,
    fill: string = '1fr'
): string {
    const safeTarget = Math.max(0, Number(targetCount) || 0);
    const current = normaliseTemplate(template ?? '');

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
    const match = current.match(/^repeat\(\s*([0-9]+)\s*,\s*([^)]+)\)\s*$/i);
    if (match) {
        const inner = match[2]!.trim();
        if (SIMPLE_TOKEN_RE.test(inner)) {
            return `repeat(${safeTarget}, ${inner})`;
        }
    }

    // Otherwise append delta units
    const additions = Array.from({ length: delta }).map(() => unit).join(' ');
    return `${current} ${additions}`.trim();
}


/**
 * Shrink a template down to exactly `targetCount` tracks.
 * - Preserves a simple `repeat(n, X)` form when possible.
 * - Strips named lines before slicing.
 *
 * @param {string} template
 * @param {number} targetCount
 * @returns {string}
 */
export function shrinkTrackTemplate(template: unknown, targetCount: unknown): string {
    if (!template || typeof template !== 'string') return '';
    const target = Math.max(0, Math.trunc(Number(targetCount) || 0));

    // Strip line names so we only work with sizes.
    const withoutLines = template.replace(/\[[^\]]*\]/g, ' ').trim();
    if (!withoutLines) return '';

    // If template is a simple repeat(n, X) with a single size token, keep it in repeat().
    const simpleRepeat = withoutLines.match(/^repeat\(\s*([0-9]+)\s*,\s*([^)]+)\)\s*$/i);
    if (simpleRepeat) {
        //const n = parseInt(simpleRepeat[1], 10);
        const inner = simpleRepeat[2]!.trim();
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


export type TrackCount = { count: number, unit: string };

/**
 * Count tracks for a grid template and derive a representative unit.
 * - Returns { count: number, unit: string }
 * - Handles: subgrid/none (0), repeat(auto-fit/fill) (0 count), mixed repeat tokens.
 *
 * @param {string} template
 * @param {string} [fallbackUnit=DEFAULT_GRID_UNIT]
 * @returns {{ count:number, unit:string }}
 */
export function countTracks(template: unknown, fallbackUnit: string = DEFAULT_GRID_UNIT): TrackCount {
    if (!template || typeof template !== 'string') return { count: 0, unit: fallbackUnit };
    
    let source = template.trim();
    if (!source) return { count: 0, unit: fallbackUnit };

    // subgrid has no fixed count
    if (/^subgrid\b/i.test(source)) return { count: 0, unit: fallbackUnit };

    // Strip line names [foo-start] etc. they don't contribute to count
    source = source.replace(/\[[^\]]*]/g, ' ').trim();
    if (!source) return { count: 0, unit: fallbackUnit };

    // repeat(auto-fill|auto-fit, ...) is indeterminate - we still try to glean a unit from inner
    const autoRep = source.match(/^\s*repeat\(\s*auto-(fill|fit)\s*,\s*(.+)\)\s*$/i);
    if (autoRep) {
        const inner = autoRep[2]!;
        return { count: 0, unit: deriveUnitFromTemplate(inner, fallbackUnit) };
    }

    // General case
    //const { count, unit } = countAndUnit(source, fallbackUnit);
    const result = countAndUnit(source, fallbackUnit);
    return { count: result.count, unit: result.unit || fallbackUnit };
}


/**
 * Internal: count tracks and derive a unit for arbitrary templates (including mixed repeat tokens).
 * - If the whole string is repeat(n, inner), multiply tokens in inner by n.
 * - Otherwise, tokenise at top-level; expand each repeat(...) token to its contribution.
 *
 * @param {string} source
 * @param {string} fallbackUnit
 * @returns {{ count:number, unit:string }}
 * @internal
 */
function countAndUnit(source: string, fallbackUnit: string): TrackCount {
    const repeat = parseRepeatAtStart(source);
    if (repeat) {
        const inner = repeat.inner.trim();
        const innerTokens = tokeniseTopLevel(inner);
        const innerCount = innerTokens.length;
        const unit = deriveUnitFromTemplate(inner, fallbackUnit);
        return { count: repeat.times * innerCount, unit: unit || fallbackUnit };
    }

    // Mixed tokens (some may be repeat(...))
    const tokens = tokeniseTopLevel(source);
    let count = 0;
    let unitHint = '';
    
    for (const token of tokens) {
        if (/^\s*repeat\(/i.test(token)) {
            const repeats = countRepeatToken(token);
            if (repeats) {
                count += repeats.count;
                if (!unitHint && repeats.unitHint) unitHint = repeats.unitHint;
                continue;
            }
            // If malformed repeat, count as one track defensively
            count += 1;
            continue;
        }
        // Non-repeat top-level token always counts as one track
        count += 1;

        // Prefer a simple size token to set the unit hint
        if (!unitHint && isSimpleSizeToken(token)) {
            unitHint = normaliseUnit(token) || '';
        }
    }

    const unit = unitHint || deriveUnitFromTemplate(source, fallbackUnit);
    return { count, unit: unit || fallbackUnit };
}


/**
 * Internal: parse "repeat(n, inner)" at the string start.
 *
 * @param {string} source
 * @returns {{times:number, inner:string}|null}
 * @internal
 */
function parseRepeatAtStart(source: string): { times: number, inner: string } | null {
    const match = source.match(/^repeat\(\s*([0-9]+)\s*,\s*([\s\S]+)\)\s*$/i);
    if (!match) return null;
    const times = parseInt(match[1]!, 10);
    const inner = match[2]!;
    if (!Number.isFinite(times) || times < 0) return null; // If inner itself contains an unmatched closing paren (malformed), bail
    return { times, inner };
}


/**
 * Internal: count a single repeat(...) token when mixed with others and optionally derive a unit hint.
 * - repeat(auto-fit/auto-fill, ...) -> { count: 0, unitHint: '' }
 *
 * @param {string} token
 * @returns {{count:number, unitHint:string}|null}
 * @internal
 */
function countRepeatToken(token: string): { count: number, unitHint: string } | null {
    const auto = token.match(/^\s*repeat\(\s*auto-(fit|fill)\s*,/i);
    if (auto) return { count: 0, unitHint: '' };

    const match = token.match(/^\s*repeat\(\s*([0-9]+)\s*,\s*([\s\S]+)\)\s*$/i);
    if (!match) return null;
        
    const times = parseInt(match[1]!, 10) || 0;
    if (times <= 0) return { count: 0, unitHint: '' };
    
    const inner = match[2]!.trim();
    const innerTokens = tokeniseTopLevel(inner);
    
    const count = times * innerTokens.length;

    let unitHint = '';
    if (innerTokens.length === 1) {
        unitHint = normaliseUnit(innerTokens[0]!) || '';
    } else {
        const simple = innerTokens.find(isSimpleSizeToken);
        unitHint = normaliseUnit(simple) || '';
    }

    return { count, unitHint };
}


/**
 * Internal: tokenise at top level (spaces outside parentheses).
 *
 * @param {string} source
 * @returns {string[]}
 * @internal
 */
function tokeniseTopLevel(source: string): string[] {
    const tokens: string[] = [];
    let depth = 0;
    let buffer = '';

    for (let i = 0; i < source.length; i++) {
        const character = source[i]!;
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


/**
 * Internal: derive a representative unit for UI hints from a template.
 * Preference order:
 *  1) Single token -> use it
 *  2) A "simple" size token among mixed tokens
 *  3) For repeat(...) use its inner tokens similarly
 *
 * @param {string} source
 * @param {string} fallbackUnit
 * @returns {string}
 * @internal
 */
function deriveUnitFromTemplate(source: string, fallbackUnit: string): string {
    if (!source) return fallbackUnit;

    const repeat = parseRepeatAtStart(source);
    if (repeat) {
        const innerTokens = tokeniseTopLevel(repeat.inner);
        if (innerTokens.length === 1) {
            return normaliseUnit(innerTokens[0]) || fallbackUnit;
        }
        const simpleInner = innerTokens.find(isSimpleSizeToken);
        if (simpleInner) return normaliseUnit(simpleInner) || fallbackUnit;
        // fall through
    }

    const tokens = tokeniseTopLevel(source);
    if (tokens.length === 1) {
        return normaliseUnit(tokens[0]) || fallbackUnit;
    }

    const simple = tokens.find(isSimpleSizeToken);
    if (simple) return normaliseUnit(simple) || fallbackUnit;

    // As a last resort, peek into repeat(...) tokens for a hint
    for (const token of tokens) {
        const repeats = countRepeatToken(token);
        if (repeats && repeats.unitHint) return repeats.unitHint;
    }
    
    // No hints found
    return fallbackUnit;
}


/**
 * Internal: whether a token is a "simple" top-level size construct.
 *
 * @param {string} token
 * @returns {boolean}
 * @internal
 */
function isSimpleSizeToken(token: string | undefined): boolean {
    if (!token) return false;
    if (/^(minmax|fit-content|clamp|var)\(/i.test(token)) return true;
    if (/^[0-9.]+(px|rem|em|ch|vh|vw|vmin|vmax|fr|%)$/i.test(token)) return true;
    if (/^(auto|max-content|min-content)$/i.test(token)) return true;
    return false;
}


/**
 * Internal: return a trimmed unit/token string or empty when falsy.
 *
 * @param {string} token
 * @returns {string}
 * @internal
 */
function normaliseUnit(token: string | undefined): string {
    if (!token) return '';
    return token.trim();
}


/**
 * Internal: expand simple repeat(n, X) (no nested repeat) to "X X X".
 *
 * @param {string} template
 * @returns {string}
 * @internal
 */
function expandSimpleRepeat(template: string): string {
    // Only expand top-level repeat(n, ...) where "..." does not contain nested repeat.
    return template.replace(/repeat\(\s*([0-9]+)\s*,\s*([^)]+)\)/gi, (_m, n, inner) => {
        const times = parseInt(n, 10);
        const unit = inner.trim();
        return Array.from({ length: times }).map(() => unit).join(' ');
    });
}


/**
 * Internal: slice a list of top-level track tokens to `targetCount`.
 *
 * @param {string} trackList
 * @param {number} targetCount
 * @returns {string}
 * @internal
 */
function sliceTrackTokens(trackList: string, targetCount: number): string {
    if (targetCount <= 0) return '';
    // Split on whitespace outside parentheses
    let depth = 0, buf = '';
    const tokens: string[] = [];
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


/* ------------------------------ Shared utils ------------------------------ */


/**
 * Coerce any possibly-bad numeric-ish input into a safe non-negative integer.
 * Returns 0 on NaN/negative/undefined.
 * @param {unknown} value
 */
export function toCount(value: unknown): number {
    const num = Number(value);
    return Number.isFinite(num) && num >= 0 ? Math.floor(num) : 0;
}


/**
 * Normalise a cell value: empty -> emptyToken.
 * @param {unknown} value
 * @param {string} emptyToken
 */
export function coerceEmpty(value: unknown, emptyToken = '.'): string {
    const output = String(value ?? '').trim();
    return output === '' ? emptyToken : output;
}


/**
 * Get a cascaded attribute value from augmented or regular attributes.
 * @param {*} augOrAttrs
 * @param {*} key
 * @returns {any}
 */
export function getCascaded(augOrAttrs: any, key: string): unknown {
    if (augOrAttrs && typeof augOrAttrs.$get === 'function') {
        return augOrAttrs.$get(key, { cascade: true });
    }
    return undefined;
};


/* ------------------------------ Areas utils ------------------------------ */

export type AreasMeasure = { hasAreas: boolean, cols: number, rows: number };

/**
 * Measure a grid-template-areas string.
 *
 * @param {string} rawTemplate
 * @returns {AreasMeasure}
 */
export function measureAreas(rawTemplate: string | undefined): AreasMeasure {
    const template = String(rawTemplate ?? '').trim();
    if (!template) return { hasAreas: false, cols: 0, rows: 0 };

    // Extract quoted rows (allow single or double quotes)
    const rows: string[] = [];
    const regex =  /"([^"]*)"|'([^']*)'/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(template))) {
        const row = (match[1] ?? match[2] ?? '').trim();
        if (row) rows.push(row);
    }

    if (!rows.length) return { hasAreas: false, cols: 0, rows: 0 };

    const cols = rows.reduce((max, row) => {
        const count = row.split(/\s+/).filter(Boolean).length;
        return Math.max(max, count);
    }, 0);

    return { hasAreas: true, cols, rows: rows.length };
}


/**
 * Serialise a 2D areas matrix into a grid-template-areas string.
 * Empty cells are filled with `emptyToken` (default ".").
 * Returns '' if the matrix is entirely emptyToken.
 *
 * @param {string[][]} matrix
 * @param {string} [emptyToken='.']
 * @returns {string}
 */
export function serialiseAreas(matrix: string[][], emptyToken: string = '.'): string {
    if (!Array.isArray(matrix) || matrix.length === 0) return '';

    const normalised = matrix.map((row) =>
        (Array.isArray(row) ? row : []).map((cell) => {
            const value = String(cell ?? '').trim();
            return value === '' ? emptyToken : value;
        })
    );
    
    const hasNonEmpty = normalised.some((row) => row.some((cell) => cell !== emptyToken));
    if (!hasNonEmpty) return '';

    return normalised.map((row) => `"${row.join(' ')}"`).join(' ');
}


/**
 * Parse a grid-template-areas string into a 2D matrix (ragged).
 *
 * @param {string} template
 * @param {string} [emptyToken='.']
 * @returns {string[][]}
 */
export function parseAreas(template: string, emptyToken: string = '.'): string[][] {
    const text = String(template ?? '').trim();
    if (!text) return [];
    
    const rows: string[][] = [];
    const regex = /"([^"]*)"|'([^']*)'/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text))) {
        const inside = (match[1] ?? match[2] ?? '').trim();
        const tokens = inside.length
            ? inside.split(/\s+/g).map(cell => (cell && cell !== emptyToken ? cell : emptyToken))
            : [];
        rows.push(tokens);
    }

    return rows;
}


/**
 * Ensure a matrix has exactly cols × rows, filling with `fill`.
 *
 * @param {string[][]} matrix
 * @param {number} cols
 * @param {number} rows
 * @param {string} [fill='.']
 * @returns {string[][]}
 */
export function ensureSize<Value>(
    matrix: readonly (readonly Value[])[] | Value[][], 
    cols: number,
    rows: number,
    fill: Value
): Value[][] {

    const colCount = toCount(cols);
    const rowCount = toCount(rows);
    if (colCount === 0 || rowCount === 0) return [];
    
    const source = Array.isArray(matrix) ? matrix : [];
    
    const output: Value[][] = [];
    for(let y = 0; y < rowCount; y++) {
        const sourceRow = Array.isArray(source[y]) ? source[y]! : [];
        const row = Array.from({ length: colCount }, (_, x) => {
            const value = (sourceRow as (Value | undefined)[])[x];
            return value === undefined ? fill : value;
        });
        output.push(row);
    }
    return output;
}


/**
 * Measure the number of tracks in a grid-template-columns or grid-template-rows string.
 * Handles repeat(N, ...), strips named lines, ignores subgrid.
 * 
 * @param {string} template
 * @returns {number}
 */
export function measureTrackCount(template: unknown): number {
    const text = String(template ?? '').trim();
    if (!text || /^subgrid\b/i.test(text)) return 0;

    // strip named lines like [col-start]
    let output = text.replace(/\[[^\]]*\]/g, ' ').trim();
    
    // expand repeat(n, body)
    output = output.replace(/repeat\(\s*(\d+)\s*,\s*([^)]+)\)/gi, (_m, n, body) =>
        Array.from({ length: parseInt(n, 10) || 0 }, () => 'X').join(' ')
    );
    
    output = output.replace(/\s+/g, ' ').trim();
    if (!output) return 0;
    return output.split(' ').filter(Boolean).length;
};


/* ------------------------------ Matrix helpers ------------------------------ */


/**
 * Resize a matrix to new cols/rows, preserving existing cells. Fills with `fill`.
 * @param {string[][]} matrix
 * @param {number} cols
 * @param {number} rows
 * @param {string} [fill='.']
 * @returns {string[][]}
 */
export function resizeMatrix(matrix: string[][], cols: number, rows: number, fill: string = '.'): string[][] {
    return ensureSize<string>(matrix, cols, rows, fill);
}


/**
 * Safely set a single cell (immutable).
 * @param {string[][]} matrix
 * @param {number} x
 * @param {number} y
 * @param {string} value
 * @param {string} [emptyToken='.']
 * @returns {string[][]}
 */
export function setCellImmutable(
    matrix: string[][],
    x: number,
    y: number,
    value: unknown,
    emptyToken: string = '.'
): string[][] {
    const source = Array.isArray(matrix) ? matrix : [];
    const rows = source.length;
    const columns = rows ? (Array.isArray(source[0]) ? source[0]!.length : 0) : 0;
    if (x < 0 || y < 0 || y >= rows || x >= columns) return source;

    const next = source.map((row) => row.slice());
    next[y]![x] = coerceEmpty(value, emptyToken);
    return next;
}


/**
 * Compute (x,y) from a 1D index inside a cols×rows board.
 * @param {number} index
 * @param {number} cols
 * @returns {[number, number]}
 */
export function xyFromIndex(index: number, cols: number): [number, number] {
    const count = Math.max(1, toCount(cols));
    const i = toCount(index);
    return [i % count, Math.floor(i / count)];
}


/* --------------------------- Grid-item helpers --------------------------- */

export type GridItemPanel = 'Simple' | 'Advanced';

/**
 * Determine which panel (Simple vs Advanced) is effectively defining the grid item.
 * Rules:
 *  - Any presence of gridArea / grid*End => Advanced
 *  - Non-numeric or negative starts => Advanced
 *  - Otherwise => Simple
 *
 * @param {Record<string, any>} [attrs={}]
 * @returns {'Simple'|'Advanced'}
 */
export function whereGridItemDefined(attrs: Record<string, unknown> = {}): GridItemPanel {
    const has = (value: unknown) => value !== undefined && value !== null && String(value).trim() !== '';
    const nonNumeric = (value: unknown) => has(value) && isNaN(Number(value));
    const negative   = (value: unknown) => Number(value) < 0;

    if (has(attrs.gridArea)) return 'Advanced';
    if (has(attrs.gridColumnEnd) || has(attrs.gridRowEnd)) return 'Advanced';
    if (nonNumeric(attrs.gridColumnStart) || nonNumeric(attrs.gridRowStart)) return 'Advanced';
    if (negative(attrs.gridColumnStart) || negative(attrs.gridRowStart)) return 'Advanced';
    return 'Simple';
}


/* ------------------------- Axis decoders (editor) ------------------------ */

export type SimpleAxis = 
    | {
        mode: 'simple',
        template: string | null,
        normalised: string,
        simple: { count: number, unit: string }
    }
    | null;

export type TracksAxis = 
    | {
        mode: 'tracks',
        template: string | null,
        normalised: string,
        tracks: string[]
    }
    | null;

export type AxisDecode =
    | { mode: 'simple'; template: string | null; normalised: string; simple: { count: number, unit: string } }
    | { mode: 'tracks'; template: string | null; normalised: string; tracks: string[] }
    | { mode: 'raw'; template: string | null; normalised: string };

/**
 * Decode a "simple" axis i.e. repeat(N, X).
 *
 * @param {string} template
 * @returns {{ mode:'simple', template:string|null, normalised:string, simple:{count:number, unit:string} }|null}
 */
export function decodeSimple(template: unknown): SimpleAxis {
    const repeats = parseRepeat(template);
    if (!repeats) return null;

    const normalised = normaliseTemplate(makeRepeat(repeats.count, repeats.unit));
    return {
        mode: 'simple',
        template: (template ? String(template) : null),
        normalised,
        simple: { count: repeats.count, unit: repeats.unit }
    }
}

/**
 * Decode an explicit tracks template (tokens separated by top-level spaces).
 *
 * @param {string} template
 * @returns {{ mode:'tracks', template:string|null, normalised:string, tracks:string[] }|null}
 */
export function decodeTracks(template: unknown): TracksAxis {
    const tokens = splitTopLevel(template);
    if (!tokens.length) return null;
    const normalised = normaliseTemplate(tokens.join(' '));
    return {
        mode: 'tracks',
        template: (template ? String(template) : null),
        normalised,
        tracks: tokens
    }
}

const DECODERS = [decodeSimple, decodeTracks];

/**
 * Decode either a simple repeat-based axis or an explicit tracks axis.
 * Falls back to { mode:'raw' } when unrecognised.
 *
 * @param {string} template
 * @returns {{ mode:'simple'|'tracks'|'raw', template:string|null, normalised:string, simple?:object, tracks?:string[] }}
 */
export function decodeAxis(template: unknown): AxisDecode {
    const tpl = template || '';
    for(const dec of DECODERS) {
        const out = dec(tpl);
        if (out) return out;
    }
    // Fallback: unknown/raw (empty or unrecognized string)
    return {
        mode: 'raw',
        template: (template ? String(template) : null),
        normalised: normaliseTemplate(template || '')
    }
}