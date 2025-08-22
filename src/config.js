export const displayProps = {
     'display': { type: 'string' },
    'visibility': { type: 'string' },
    'overflow': { type: 'string' }
};

export const dimensionProps = {
    'width': { type: 'string' },
    'height': { type: 'string' },
    'maxWidth': { type: 'string' },
    'maxHeight': { type: 'string' },
    'minWidth': { type: 'string' },
    'minHeight': { type: 'string' },
};

export const marginProps = {
    'marginTop': { type: 'string' },
    'marginRight': { type: 'string' },
    'marginBottom': { type: 'string' },
    'marginLeft': { type: 'string' }
};

export const paddingProps = {
    'paddingTop': { type: 'string' },
    'paddingRight': { type: 'string' },
    'paddingBottom': { type: 'string' },
    'paddingLeft': { type: 'string' }
};

export const modeProps = {
    'dimensionMode': { type: 'string' },
    'minDimensionMode': { type: 'string' },
    'maxDimensionMode': { type: 'string' },
    'marginMode': { type: 'string' },
    'paddingMode': { type: 'string' }
};

export const flexProps = {
    'flexDirection': { type: 'string' },
    'flexWrap': { type: 'string' },
    'justifyContent': { type: 'string' },
    'alignItems': { type: 'string' },
    'alignContent': { type: 'string' },
    'gapColumn': { type: 'string' },
    'gapRow': { type: 'string' }
};

export const flexItemProps = {
    'flexGrow': { type: 'number' },
    'flexShrink': { type: 'number' },
    'flexBasis': { type: 'string' },
    'alignSelf': { type: 'string' },
    'order': { type: 'number' }
};

export const COSTERED_LAYOUT_SCHEMA = {
    ...displayProps,
    ...dimensionProps,
    ...marginProps,
    ...paddingProps,
    ...flexProps,
    ...flexItemProps,
    ...modeProps
}

export const COSTERED_SCHEMA = Object.assign(
    {},
    ...Object.values(COSTERED_LAYOUT_SCHEMA)
)

export const BLOCKS_WITH_EDITOR_STYLES = [
    'core/paragraph',
    'core/heading',
    'core/list',
    'core/quote',
    'core/pullquote',
    'core/table'
]