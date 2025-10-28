// src/utils/gapUtils.ts

export type GapTokens = [string, string?];

/** Coerce to trimmed string; null/undefined -> ''. */
export const normalize = (v: unknown): string => (v == null ? '' : String(v).trim());

/**
 * Split a CSS gap string into row/column (max 2 tokens).
 * Example: "10px 1rem" -> ["10px","1rem"]; "12px" -> ["12px"].
 * Respects spaces inside parentheses.
 */
export const splitGap = (s: unknown = ''): GapTokens => {
    const tokens = normalize(s).split(/\s+(?![^(]*\))/).filter(Boolean).slice(0, 2);
    return tokens.length === 2 ? [tokens[0]!, tokens[1]!] : [tokens[0]!];
}
    
// Join row/column into a CSS gap string.
// Examples: ["10px","1rem"] -> "10px 1rem"; ["12px"] -> "12px"; [] -> "".
export const joinGap = (row: unknown = '', col: unknown = ''): string => {
    const r = normalize(row);
    const c = normalize(col);
    return [r, c].filter(Boolean).join(' ').trim();
}