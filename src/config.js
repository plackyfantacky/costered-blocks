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


export const flexProps = {
    'flexDirection': { type: 'string' },
    'flexWrap': { type: 'string' },
    'justifyContent': { type: 'string' },
    'alignItems': { type: 'string' },
    'alignContent': { type: 'string' },
};

export const flexItemProps = {
    'flexGrow': { type: 'number' },
    'flexShrink': { type: 'number' },
    'flexBasis': { type: 'string' }
};

export const gridProps = {
    'gridTemplateColumns': { type: 'string' },
    'gridTemplateRows' : { type: 'string' },
    'gridTemplateAreas': { type: 'string' }
}

export const gridItemsProps = {
    'gridColumn': { type: 'string', default: '' },
    'gridRow': { type: 'string', default: '' },
    'gridArea': { type: 'string', default: '' }
}

const nonCSSGridItemProps = {
    'gridColumnStart': { type: 'string' },
    'gridColumnSpan': { type: 'string' },
    'gridColumnEnd': { type: 'string' },
    'gridRowStart': { type: 'string' },
    'gridRowSpan': { type: 'string' },
    'gridRowEnd': { type: 'string' }
}

export const  sharedProps = {
    'gap': { type: 'string' },
    'order': { type: 'number' },
    'alignSelf': { type: 'string' },
    'justifySelf': { type: 'string' },
}

export const COSTERED_LAYOUT_SCHEMA = {
    ...displayProps,
    ...dimensionProps,
    ...marginProps,
    ...paddingProps,
    ...flexProps,
    ...flexItemProps,
    ...gridProps,
    ...gridItemsProps,
    ...nonCSSGridItemProps,
    ...sharedProps
}

export const COSTERED_SCHEMA = Object.assign(
    {},
    ...Object.values(COSTERED_LAYOUT_SCHEMA)
)

/** user preferences  */
export const modeProps = [
    'dimensionMode',
    'minDimensionMode',
    'maxDimensionMode',
    'marginMode',
    'paddingMode',
    'gapMode',
    'gapInputMode',
    'gridTemplateColumnsMode',
    'gridTemplateRowsMode'
];

export const MUST_BE_SCOPED = new Set([
    ...modeProps,
])

export const VERBATIM_STRING_KEYS = new Set([
    ...Object.keys(gridItemsProps)
]);

/** misc */
export const BLOCKS_WITH_EDITOR_STYLES = [
    'core/paragraph',
    'core/heading',
    'core/list',
    'core/quote',
    'core/pullquote',
    'core/table'
];

export const DEFAULT_GRID_UNIT = '1fr';

/**
 * Editor Style Mirror keys.
 * These three keys are used to determine what block attributes (styles) should be mirrored
 * in the block editor. The WP Block Editor can be tough to work with as the editor state is
 * always being updated by something (too many things to list). The Editor Style Mirror (located
 * in ./src/filters/editor-style-mirror.js) gives us a little bit of control over that state, but
 * we neeed to specify what styles can be set using these three keys.
 * To add addtional styles, add the appropriate block attribute (css style in camelCase), make a
 * group of props like the example below, and include that group in MISC_KEYS.
 * 
 * export const customProps = {
 *   'propertyName': { type: 'string|number' },
 * };
 * 
 */

/** Please don't touch this key. Controls padding styles in the Block Editor. Won't function without this. */
export const PADDING_KEYS = new Set([
    ...Object.keys(paddingProps)
]);

/** Please don't touch this key. Controls width/height styles in the Block Editor. Won't function without this. */
export const SIZE_KEYS = new Set([
   ...Object.keys(dimensionProps)
]);

/** Please don't touch this key. Lists grid item track and span properties that must be transformed to CSS grid shorthand properties. */
export const NON_CSS_GRID_ITEM_KEYS = new Set([
   ...Object.keys(nonCSSGridItemProps)
]);

/** If you want to extend this, create your own group and include it like the other groups below.  */
export const MISC_KEYS = new Set([
    {},
    ...Object.keys(displayProps),
    ...Object.keys(flexProps),
    ...Object.keys(flexItemProps),
    ...Object.keys(gridProps),
    ...Object.keys(gridItemsProps),
    ...Object.keys(nonCSSGridItemProps),
    ...Object.keys(sharedProps),
    //...Object.keys(yourGroupGoesHere),
])