import { LABELS } from "@labels";

const labels = LABELS.blocks.inlineSVG;

/**
 * Fetches the sanitised SVG markup for a given attachment ID via a custom REST API endpoint.
 * Throws an error if the response is invalid or does not contain valid SVG.
 */
export async function fetchSanitisedSVG(attachmentId: number): Promise<string> {
    //fetch via WP REST API custom endpoint
    const apiFetch = (window as any)?.wp?.apiFetch;
    const res = await apiFetch?.({
        path: `/costered-blocks/v1/svg/${attachmentId}`,
        method: 'GET',
        parse: true
    });

    // validate response matches expected shape (has 'svg' property with string value)
    const svg = typeof res?.svg === 'string' ? res.svg : null;
    if (!svg) throw new Error(labels.notice.errorFetchResponseInvalid);

    // check if the returned SVG is not empty or malformed
    if (svg.trim() === '') {
        throw new Error(labels.notice.errorFetchResponseEmpty);
    }

    // check the returned SVG contains <svg> tag
    if (!/<svg[\s\S]*?>[\s\S]*?<\/svg>/i.test(svg)) {
        throw new Error(labels.notice.errorFetchResponseInvalid);
    }
    return svg;
}

/**
 * cleans up non-self-closing and stray doctypes in SVG markup to be safely embedded within HTML inside the block editor. 
 */
export function normaliseSVGForHTML(input: string): string {
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

// Applies width and height attributes to the root <svg> element in the provided SVG markup.
// (refactor: remove the checks for valid SVG, as we should be past that point if this function 
// is being called. validation is done in fetchSanitisedSVG, and formatting in normaliseSVGForHTML)

export function applySVGDimensions(svgMarkup: string, width?: string, height?: string): string {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgMarkup, 'image/svg+xml');
        const svg = doc.documentElement;
        // intentional: no validation check here. garbage in, garbage out. 

        const w = (width ?? '').trim();
        const h = (height ?? '').trim();
        if (w) svg.setAttribute('width', w); else svg.removeAttribute('width');
        if (h) svg.setAttribute('height', h); else svg.removeAttribute('height');

        return new XMLSerializer().serializeToString(svg);
}