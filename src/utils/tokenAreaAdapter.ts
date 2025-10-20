// ./src/tokenAreaAdapter.ts
import type { Matrix } from "@types";

/**
 * Parse a CSS grid-template-areas string into a 2D matrix of strings.
 *
 * Handles whitespace, missing quotes, and escaped lines gracefully.
 * Returns [["."]] for invalid or empty input.
 */
export function parseAreasToMatrix(input: unknown, emptyToken: string = '.'): Matrix {
    const raw = String(input ?? '').trim();
    const rows = raw.match(/"([^"]*)"/g) || [];
    if (!raw) return [[emptyToken]];

    return rows.map((quoted) => {
        const stripped = quoted.replace(/^"|"$|'/g, '').trim();
        const cells = stripped.split(/\s+/).filter(Boolean);
        return cells.length > 0 ? cells : [emptyToken];
    });
}

/**
 * Compose a 2D matrix of strings into a valid grid-template-areas CSS string.
 */
export function composeMatrixToAreas(matrix: Matrix, emptyToken: string = '.'): string {
    if (!Array.isArray(matrix) || (matrix as any[]).length === 0) return '""';

    const rows = (matrix as string[][]).map((row) => {
        if(!Array.isArray(row) || row.length === 0) return`"${emptyToken}"`;
        const joined = row.map((cell) => (cell?.trim() ? cell.trim() : emptyToken)).join(' ');
        return `"${joined}"`;
    });

    return rows.join('\n');
}

/**
 * Ensure rectangular shape and minimum size; fill with emptyToken.
 */
export function ensureSize(
    matrix: Matrix | unknown,
    cols: number,
    rows: number,
    emptyToken: string = '.'
): Matrix {
    const src = (Array.isArray(matrix) ? (matrix as Matrix) : []) as Matrix;
    const C = Math.max(1, Math.trunc(cols));
    const R = Math.max(1, Math.trunc(rows));
    return Array.from({ length: R }, (_, ry) =>
        Array.from({ length: C }, (_, cx) => src[ry]?.[cx] ?? emptyToken)
    );
}

/**
 * Create a new empty matrix.
 */
export function createEmptyMatrix(cols: number, rows: number, emptyToken: string = '.'): Matrix {
    return ensureSize([], cols, rows, emptyToken);
}