const displayProps = {
     'display': { type: 'string' },
    'visibility': { type: 'string' },
    'overflow': { type: 'string' }
};

const dimensionProps = {
    'width': { type: 'string' },
    'height': { type: 'string' },
    'maxWidth': { type: 'string' },
    'maxHeight': { type: 'string' },
    'minWidth': { type: 'string' },
    'minHeight': { type: 'string' },
};

const marginProps = {
    'marginTop': { type: 'string' },
    'marginRight': { type: 'string' },
    'marginBottom': { type: 'string' },
    'marginLeft': { type: 'string' }
};

const paddingProps = {
    'paddingTop': { type: 'string' },
    'paddingRight': { type: 'string' },
    'paddingBottom': { type: 'string' },
    'paddingLeft': { type: 'string' }
};

const modeProps = {
    'dimensionMode': { type: 'string' },
    'minDimensionMode': { type: 'string' },
    'maxDimensionMode': { type: 'string' },
    'marginMode': { type: 'string' },
    'paddingMode': { type: 'string' }
};

export const COSTERED_LAYOUT_SCHEMA = {
    ...displayProps,
    ...dimensionProps,
    ...marginProps,
    ...paddingProps,
    ...modeProps
}

export const COSTERED_SCHEMA = Object.assign(
    {},
    ...Object.values(COSTERED_LAYOUT_SCHEMA)
)