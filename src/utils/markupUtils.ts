/**
 * Normalises SVG markup to be safely embedded within HTML inside the block editor. 
 */
export function normaliseSVGForHTML(input: string): string {
    if (!input) return '';

    let svg = input
        .replace(/^\uFEFF/, '')
        .replace(/<\?xml[^>]*?>/gi, '')
        .replace(/<!DOCTYPE[^>]*?>/gi, '')
        .trim();

    const SELF_CLOSING = [
        'path','rect','circle','ellipse','line','polyline','polygon','stop','use',
        'g','mask','clipPath','linearGradient','radialGradient','pattern','marker','defs'
    ];

    const result = new RegExp(`<(${SELF_CLOSING.join('|')})(\\b[^>]*)\\/\\s*>`, 'gi');
    svg = svg.replace(result, '<$1$2></$1>');

    // Normalise whitespace around tags a little (optional, helps with diffs)
    svg = svg.replace(/\s+>/g, '>').replace(/>\s+</g, '><');

    return svg;
}