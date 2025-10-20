
// src/utils/composeGridStyles.ts

type AnyStyle = Record<string, unknown>;
type StringStyle = Record<string, string>;

type GridPlacementInput = {
    gridArea?: unknown;
    gridColumn?: unknown;
    gridRow?: unknown;
}

const isNonEmpty = (value: unknown): value is string =>
    typeof value === 'string' ? value.trim() !== '' : !!value;

export function composeExclusiveGridStyle(
    input: GridPlacementInput
): Partial<StringStyle> {
    const style: Partial<StringStyle> = {};
    const { gridArea, gridColumn, gridRow } = input || {};

    
    if (isNonEmpty(gridArea)) {
        style.gridArea = String(gridArea);
        return style; // bail: do not include longhands if shorthand is present
    }

    if (isNonEmpty(gridColumn)) {
        style.gridColumn = String(gridColumn);
    }

    if (isNonEmpty(gridRow)) {
        style.gridRow = String(gridRow);
    }
    return style;
}

/**
 * Append `!important` to all non-empty string values.
 */
export function withImportant(style: AnyStyle = {}): StringStyle {
    const output: StringStyle = {};
    for (const [key, value] of Object.entries(style || {})) {
        if (isNonEmpty(value)) {
            output[key] = `${value} !important`;
        }
    }
    return output;
}

/**
 * Drop grid placement keys.
 */
export function omitGridPlacementKeys<Token extends AnyStyle>(style: Token = {} as Token): Omit<Token, 'gridArea' | 'gridColumn' | 'gridRow'> {
    const { gridArea, gridColumn, gridRow, ...rest } = (style || {}) as AnyStyle & GridPlacementInput;
    return rest as Omit<Token, 'gridArea' | 'gridColumn' | 'gridRow'>;
}