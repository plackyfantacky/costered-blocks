import configData from '../config/config.json' with { type: 'json' };

// types

type AttributeGroup = 
    | 'display'
    | 'dimension'
    | 'margin'
    | 'padding'
    | 'flex'
    | 'flex-item'
    | 'grid'
    | 'grid-item'
    | 'position'
    | 'shared';

type AttributeDef = {
    css: string;
    group: AttributeGroup;
    [key: string]: unknown;
};

type ConfigJson = {
    attributes: Record<string, AttributeDef>;
    collections: {
        editorStyles?: string[] | null;
        unitless?: string[] | null;
        clearSets?: {
            gridAreas?: string[] | null;
            gridColumns?: string[] | null;
            gridRows?: string[] | null;
        } | null;
    } | null;
    settings?: {
        gridUnit?: string | null;
        appendImportantToMirroredStyles?: boolean | null;
        styleTagId?: string | null;
        reduxStoreKey?: string | null;
        sidebarID?: string | null;
        breakpoints?: {
            mobile?: number | null;
            tablet?: number | null;
            desktop?: number | null;
        } | null;
    } | null;
}

// helpers
const arr = <Token>(value: unknown): Token[] => (Array.isArray(value) ? (value as Token[]) : []);
const toSet = <Token extends string>(value: unknown): ReadonlySet<Token> => new Set(arr<Token>(value));

function pickByGroup<Group extends AttributeGroup>(
    group: Group
): Record<string, AttributeDef & { group: Group }> {
    const src = (configData as ConfigJson).attributes || {};
    return Object.fromEntries(
        Object.entries(src).filter(([, definition]) => definition.group === group)
    ) as Record<string, AttributeDef & { group: Group }>;
}

export const COSTERED_ATTRIBUTE_SHAPE = {
    type: 'object',
    default: {
        desktop: { styles: {} },
        tablet: { styles: {} },
        mobile: { styles: {} },
    },
} as const;

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

export const COSTERED_LAYOUT_SCHEMA: Record<string, AttributeDef> = {
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

export const VERBATIM_STRING_KEYS: ReadonlySet<string> = new Set([
    ...Object.keys(gridItemsProps)
]);

/** misc */
export const BLOCKS_WITH_EDITOR_STYLES: readonly string[] = arr<string>((configData as ConfigJson)?.collections?.editorStyles);
export const UNITLESS: ReadonlySet<string> = toSet<string>((configData as ConfigJson)?.collections?.unitless);

export const DEFAULT_GRID_UNIT: string = (configData as ConfigJson)?.settings?.gridUnit || '1fr';
export const MIRROR_APPEND_IMPORTANT_FOR_GRID: boolean = !!(configData as ConfigJson)?.settings?.appendImportantToMirroredStyles;
export const STYLE_TAG_ID: string = (configData as ConfigJson)?.settings?.styleTagId || 'costered-blocks-style-mirror';
export const REDUX_STORE_KEY: string = (configData as ConfigJson)?.settings?.reduxStoreKey || 'costered/ui';
export const SIDEBAR_ID: string = (configData as ConfigJson)?.settings?.sidebarID || 'costered-blocks--sidebar';

export const MOBILE_THRESHOLD: number = (configData as ConfigJson)?.settings?.breakpoints?.mobile ?? 782;
export const TABLET_THRESHOLD: number = (configData as ConfigJson)?.settings?.breakpoints?.tablet ?? 1024;
export const DESKTOP_THRESHOLD: number = (configData as ConfigJson)?.settings?.breakpoints?.desktop ?? 1440;

export const GRID_AREA_KEYS: readonly string[] = arr<string>((configData as ConfigJson)?.collections?.clearSets?.gridAreas);
export const GRID_COLUMN_KEYS: readonly string[] = arr<string>((configData as ConfigJson)?.collections?.clearSets?.gridColumns);
export const GRID_ROW_KEYS: readonly string[] = arr<string>((configData as ConfigJson)?.collections?.clearSets?.gridRows);

export const IS_DEBUG: boolean = true;


/**
 * Editor Style Mirror keys.
 * The WP Block Editor can be tough to work with as the editor state is always being updated by 
 * something (too many things to list). The Editor Style Mirror (located in 
 * ./src/filters/editor-style-mirror.js) gives us a little bit of control over that state, but
 * we need to specify what styles can be set using the below keys.
 */
export const MIRRORED_STYLE_KEYS: ReadonlySet<string> = new Set<string>([
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

export const ATTRS_TO_CSS: Record<string, string> = Object.fromEntries(
    Object.entries((configData as ConfigJson).attributes).map(([key, def]) => [key, def.css])
);