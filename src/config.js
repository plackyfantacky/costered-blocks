import configData from '../config/config.json' with { type: 'json' };

// helpers
const arr = (value) => (Array.isArray(value) ? value : []);
const toSet = (value) => new Set(arr(value));

export const COSTERED_ATTRIBUTE_SHAPE = {
    type: 'object',
    default: {
        desktop: {
            styles: {}
        },
        tablet: {
            styles: {}
        },
        mobile: {
            styles: {}
        }
    },
}

function pickByGroup(group) {
    return Object.fromEntries(
        Object.entries(configData.attributes).filter(([key, value]) => value.group === group)
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
export const positionProps = pickByGroup('position');
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
    ...positionProps,
    ...sharedProps,
}

export const VERBATIM_STRING_KEYS = new Set([
    ...Object.keys(gridItemsProps)
]);

/** misc */
export const BLOCKS_WITH_EDITOR_STYLES = arr(configData?.collections?.editorStyles);
export const UNITLESS = toSet(configData?.collections?.unitless);

export const DEFAULT_GRID_UNIT = configData?.settings?.gridUnit || '1fr';
export const MIRROR_APPEND_IMPORTANT_FOR_GRID = !!configData?.settings?.appendImportantToMirroredStyles;
export const STYLE_TAG_ID = configData?.settings?.styleTagId || 'costered-blocks-style-mirror';
export const REDUX_STORE_KEY = configData?.settings?.reduxStoreKey || 'costered/ui';

export const MOBILE_THRESHOLD = configData?.settings?.breakpoints?.mobile ?? 782;
export const TABLET_THRESHOLD = configData?.settings?.breakpoints?.tablet ?? 1024;
export const DESKTOP_THRESHOLD = configData?.settings?.breakpoints?.desktop ?? 1440;

export const IS_DEBUG = false;

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
    ...Object.keys(positionProps),
    ...Object.keys(sharedProps)
]);

export const ATTRS_TO_CSS = Object.fromEntries(
    Object.entries(configData.attributes).map(([key, def]) => [key, def.css])
);