export const splitGap = (s = '') =>
    (s + '').trim().split(/\s+(?![^(]*\))/).filter(Boolean).slice(0, 2);

export const joinGap = (row = '', col = '') =>
    [row, col].filter(Boolean).join(' ').trim();

export const normalize = (v) => (v == null ? '' : String(v).trim());