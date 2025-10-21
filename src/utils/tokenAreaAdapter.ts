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
 * 
 * the order of targetRows and targetCols is intentional here. do not rearrange. 
 * or do. I don't care. The UI controls (+/-) will swap columns for rows. You've been warned.
 */
export function ensureSize(
    matrix: Matrix,
    targetRows: number, // outer array (of rows)
    targetCols: number, // inner array (of columns)
    emptyToken: string = '.'
): Matrix {
    const rows = [...matrix]

    while(rows.length < targetRows)  rows.push(Array(targetCols).fill(emptyToken));
    while(rows.length > targetRows) rows.pop();

    for (let i = 0; i < rows.length; i++) {
        const row = [...(rows[i] ?? [])];
        if (row.length < targetCols) {
            while (row.length < targetCols) row.push(emptyToken);
        } else if (row.length > targetCols) {
            row.length = targetCols;
        }
        rows[i] = row;
    }
    
    return rows;
}

/**
 * Create a new empty matrix.
 */
export function createEmptyMatrix(cols: number, rows: number, emptyToken: string = '.'): Matrix {
    return ensureSize([], rows, cols, emptyToken); //ignore the reversed column/row order. you didn't see anything.
}