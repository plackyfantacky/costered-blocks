export function composeExclusiveGridStyle({ gridArea, gridColumn, gridRow }) {
    const style = {};
    const hasArea = typeof gridArea === 'string' ? gridArea.trim() !== '' : !!gridArea;
    if (hasArea) {
        style.gridArea = gridArea;
        return style; // bail: do not include longhands if shorthand is present
    }
    if (typeof gridColumn === 'string' ? gridColumn.trim() !== '' : !!gridColumn) {
        style.gridColumn = gridColumn;
    }
    if (typeof gridRow === 'string' ? gridRow.trim() !== '' : !!gridRow) {
        style.gridRow = gridRow;
    }
    return style;
}

export function withImportant(style = {}) {
    const output = {};
    Object.entries(style).forEach(([key, value]) => {
        if (typeof value === 'string' && value.trim() !== '') {
            output[key] = `${value} !important`;
        }
    });
    return output;
}

export function omitGridPlacementKeys(style = {}) {
    const { gridArea, gridColumn, gridRow, ...rest } = style || {};
    return rest;
}