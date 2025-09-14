import attributes from '../config/attributes.json' with { type: 'json' };

function pickByGroup(group) {
    return Object.fromEntries(
        Object.entries(attributes).filter(([key, value]) => value.group === group)
    );
}

export const displayProps = pickByGroup('display') 
export const dimensionProps = pickByGroup('dimension');
export const marginProps = pickByGroup('margin');
export const paddingProps = pickByGroup('padding');
export const flexProps = pickByGroup('flex');
export const flexItemProps = pickByGroup('flex-item');
export const gridProps = pickByGroup('grid');
export const gridItemsProps = pickByGroup('grid-item');
export const sharedProps = pickByGroup('shared');

export const COSTERED_LAYOUT_SCHEMA = {
    ...displayProps,
    ...dimensionProps,
    ...marginProps,
    ...paddingProps,
    ...flexProps,
    ...flexItemProps,
    ...gridProps,
    ...gridItemsProps,
    ...sharedProps,
}

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
 * The WP Block Editor can be tough to work with as the editor state is always being updated by 
 * something (too many things to list). The Editor Style Mirror (located in 
 * ./src/filters/editor-style-mirror.js) gives us a little bit of control over that state, but
 * we need to specify what styles can be set using the below keys.
 */
export const MIRRORED_STYLE_KEYS = new Set([
    ...Object.keys(displayProps),
    ...Object.keys(dimensionProps),
    ...Object.keys(paddingProps),
    ...Object.keys(marginProps),
    ...Object.keys(flexProps),
    ...Object.keys(flexItemProps),
    ...Object.keys(gridProps),
    ...Object.keys(gridItemsProps),
    ...Object.keys(sharedProps)
]);

export const ATTRS_TO_CSS = Object.fromEntries(
    Object.entries(attributes).map(([key, def]) => [key, def.css])
);