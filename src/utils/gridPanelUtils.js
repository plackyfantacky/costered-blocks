import { DEFAULT_GRID_UNIT } from "@config";

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
export function splitTopLevel(s) {
    const str = String(s || '').trim();
    if (!str) return [];

    let depth = 0, buffer = '';
    const out = [];
    for (let i = 0; i < str.length; i++) {
        const character = str[i];
        if (character === '(') { depth++; buffer += character; continue; }
        if (character === ')') { depth = Math.max(0, depth - 1); buffer += character; continue; }
        if (character === ' ' && depth === 0) {
            if (buffer) { out.push(buffer); buffer = ''; }
            continue;
        }
        buffer += character;
    }
    if (buffer) out.push(buffer);
    return out;
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

export function countTracks(template) {
    if (!template) return 0;
    const repeats = parseRepeat(template);
    if (repeats) return repeats.count;
    return splitTopLevel(template).length;
}

/* decoder functions that read the value of attrs.gridTemplate{axis} and allow GridPanelPanes to read the values */

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

// Order matters: try more specific decoders first.
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

export function decodeAreas(areasTemplate) {
    if (!areasTemplate) return { template: null, cols: 0, rows: 0, matrix: []}
    
    // areas is usually a string like: "'. a a' '. b c'"
    // We accept either quoted rows joined by spaces or plain newline-separated rows.
    const raw = String(areasTemplate).trim();
    const rows = raw
        // split by quotes if present, else split by newline
        .split(/"\s*"\s*|'\s*'\s*|\n+/)
        .map((r) => r.replace(/^["']|["']$/g, '').trim())
        .filter(Boolean);

    const matrix = rows.map((row) => row.split(/\s+/).filter(Boolean));

    const rowCount = matrix.length;
    const colCount = rowCount ? Math.max(...matrix.map((row) => row.length)) : 0;

    return {
        template: areasTemplate,
        cols: colCount,
        rows: rowCount,
        matrix
    }
}