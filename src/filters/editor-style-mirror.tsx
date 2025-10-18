/**
 * Costered Blocks – Editor Style Mirror
 *
 * These utilities let block attributes (like width, margin, padding, flex settings, etc.)
 * automatically reflect in the block editor’s inline styles, so the editor layout
 * stays visually consistent with the saved frontend output.
 *
 * - buildMirror(attrs):    
 *     Examines a block’s attributes and builds an inline `style` object
 *     (plus some helper flags) for supported properties:
 *       • dimensions (width/height/min/max)
 *       • spacing (padding, margin)
 *       • misc layout (display, flexDirection)
 *     It also handles quirks like overriding blockGap with logical properties
 *     and ensuring null/empty values don’t bleed through.
 *
 * - withEditorStyleMirror(BlockListBlock):
 *     A Higher-Order Component (HOC) that wraps Gutenberg’s BlockListBlock.
 *     It uses `useSelect` to grab the current block’s attributes, runs them
 *     through `buildMirror`, and merges the result into the block’s wrapperProps.
 *     This ensures the editor preview updates live as attributes change,
 *     without extra re-renders or manual MutationObservers.
 */
import { addFilter } from '@wordpress/hooks';
import { useSelect } from '@wordpress/data';
import { memo, useLayoutEffect, useMemo } from '@wordpress/element';

import type { AugmentedAttributes, CSSPrimitive } from "@types";
import { asNonEmptyString, maybeFormat } from "@utils/common";
import { augmentAttributes } from '@utils/breakpointUtils';
import { selectActiveBreakpoint } from '@stores/activeBreakpoint';

import {
    MIRRORED_STYLE_KEYS,
    ATTRS_TO_CSS,
    gridItemsProps,
} from '@config';

// Logical CSS properties for margin overrides (to beat blockGap)
const LOGICAL_CSS_PROPS: Record<string, string> = {
    marginInlineStart: 'margin-inline-start',
    marginInlineEnd: 'margin-inline-end',
    marginBlockStart: 'margin-block-start',
    marginBlockEnd: 'margin-block-end',
};

/**
 * #notafunction
 * Mapping of grid placement attribute keys to CSS properties and camelCase versions.
 * Used to ensure exclusivity of grid-area over grid-column/row and to append !important if configured.
 */

type PlacementEntry = { css: string; attr: string };
type PlacementKey = 'gridArea' | 'gridColumn' | 'gridRow';

const DEFAULT_PLACEMENT: Record<PlacementKey, PlacementEntry> = {
    gridArea: { css: 'grid-area', attr: 'gridArea' },
    gridColumn: { css: 'grid-column', attr: 'gridColumn' },
    gridRow: { css: 'grid-row', attr: 'gridRow' },
};

const PLACEMENT: Record<PlacementKey, PlacementEntry> & Record<string, PlacementEntry> = {
    ...DEFAULT_PLACEMENT
};

type GridItemProp = { css?: string };
const keys = Object.keys((gridItemsProps || {}) as Record<string, GridItemProp>);

for (const key of keys) {
    const css = 
        (gridItemsProps as Record<string, GridItemProp>)[key]?.css
        ?? PLACEMENT[key]?.css 
        ?? key;
    PLACEMENT[key] = { css, attr: maybeFormat(css, { toCamelCase: true }) };
}

const GRID_AREA_ATTR = PLACEMENT.gridArea.attr;
const GRID_COLUMN_ATTR = PLACEMENT.gridColumn.attr;
const GRID_ROW_ATTR = PLACEMENT.gridRow.attr;

/**
 * Build a style object from block attributes.
 *
 * Iterates over dimension, spacing, and layout keys, converting attribute values into valid 
 * inline styles. Also sets logical margin properties to override blockGap and returns flags 
 * for which sides are set.
 */
function buildMirror(attributes: Partial<AugmentedAttributes> = {}) {
    // prefer responsive-aware reads (raw per active breakpoint); fallback to legacy props (if any left)
    const read = (key: string): CSSPrimitive | undefined => {
        const getter = (attributes as any)?.$get;
        return typeof getter === 'function' ? getter(key) : (attributes as any)?.[key];
    };

    const style: Record<string, string | number> = {};
    let any = false;

    // Track which margin sides are set for class flags
    let hasMt = false, hasMb = false, hasMl = false, hasMr = false;

    // margin top
    const mt = asNonEmptyString(read('marginTop'));
    if (mt) {
        style.marginTop = mt;
        style.marginBlockStart = mt; // <- beats parent’s blockGap rule
        any = true;
        hasMt = true;
    }

    // margin bottom
    const mb = asNonEmptyString(read('marginBottom'));
    if (mb) {
        style.marginBottom = mb;
        style.marginBlockEnd = mb; // <- beats parent’s blockGap rule
        any = true;
        hasMb = true;
    }

    // margin left
    const ml = asNonEmptyString(read('marginLeft'));
    if (ml) {
        style.marginLeft = ml;
        style.marginInlineStart = ml; // <- beats parent’s blockGap rule
        any = true;
        hasMl = true;
    }

    // margin right
    const mr = asNonEmptyString(read('marginRight'));
    if (mr) {
        style.marginRight = mr;
        style.marginInlineEnd = mr; // <- beats parent’s blockGap rule
        any = true;
        hasMr = true;
    }

    // zIndex
    const zIndex = asNonEmptyString(read('zIndex'));
    if (zIndex) {
        const value = Number(zIndex);
        style.zIndex = value;
        any = true;
    }

    // grid shorthands
    const area = String(read(GRID_AREA_ATTR) ?? '').trim();
    if (area && !area.includes('/') && !/\bspan\b/i.test(area)) { 
        style[GRID_AREA_ATTR] = area; 
        any = true; 
    }

    //grid column
    const col = String(read(GRID_COLUMN_ATTR) ?? '').trim();
    if (col) {     
        // handle "X / span -N" → "X - N / X"
        const match = col.match(/^(\d+)\s*\/\s*span\s*(-?\d+)$/i);
        if (match) {
            const start = parseInt(match[1]!, 10);
            const span = parseInt(match[2]!, 10);
            if (span < 0) {
                const end = start;
                const newStart = start + span; // move backwards
                style[GRID_COLUMN_ATTR] = `${newStart} / ${end}`;
            } else {
                style[GRID_COLUMN_ATTR] = col;
            }
        } else {
            style[GRID_COLUMN_ATTR] = col;
        }
        any = true; 
    }

    //grid row
    const row = String(read(GRID_ROW_ATTR) ?? '').trim();
    if (row) { 
        // handle "X / span -N" → "X - N / X"
        const match = row.match(/^(\d+)\s*\/\s*span\s*(-?\d+)$/i);
        if (match) {
            const start = parseInt(match[1]!, 10);
            const span = parseInt(match[2]!, 10);
            if (span < 0) {
                const end = start;
                const newStart = start + span; // move backwards
                style[GRID_ROW_ATTR] = `${newStart} / ${end}`;
            } else {
                style[GRID_ROW_ATTR] = row;
            }
        } else {
            style[GRID_ROW_ATTR] = row;
        }
        any = true; 
    }

    // All other mirrored style keys (skip margins and grid shorthands already handled)
    for (const key of Array.from(MIRRORED_STYLE_KEYS)) {
        if (
            key === 'marginTop' || key === 'marginBottom' ||
            key === 'marginLeft' || key === 'marginRight' ||
            key === 'zIndex' || key === 'z-index' ||
            key === GRID_AREA_ATTR || key === GRID_COLUMN_ATTR || key === GRID_ROW_ATTR
        ) continue;
        const value = asNonEmptyString(read(key));
        if (value) {
            style[key] = String(value);
            any = true;
        }
    }

    // has flexDirection: ensure display:flex is set if it is
    // ensure flexDirection “sticks”
    const haveFlexDir = asNonEmptyString(read('flexDirection'));
    if (haveFlexDir && !style.display) {
        style.display = 'flex';
        any = true;
    }

    // drop any empty/"undefined"/"null" strings from style
    Object.keys(style).forEach((key) => {
        const value = asNonEmptyString((style as any)[key]);
        if (value === null) {
            delete (style as any)[key];
        } else {
            // normalise strings in-place (trim)
            (style as any)[key] = String(value).trim();
        }
    });

    return { style, any, hasMt, hasMb, hasMl, hasMr, haveFlexDir };
}

/**
 * Wrap BlockListBlock with live style mirroring.
 *
 * Reads the block’s attributes via useSelect, runs them through buildMirror, and merges the
 * resulting styles/class flags into wrapperProps. Ensures editor reflects frontend layout 
 * instantly.
 */
function withEditorStyleMirror(BlockListBlock: any) {
    const Wrapped = memo((props: any) => {
        const block = useSelect(
            (select: any) => (props.clientId ? select('core/block-editor').getBlock(props.clientId) : null),
            [props.clientId]
        );
        const attrs = (block?.attributes as Record<string, unknown>) || {};
        const breakpoint = useSelect(selectActiveBreakpoint, []);
        const augmented = useMemo<AugmentedAttributes>(
            () => augmentAttributes(attrs as any, breakpoint as any),
            [attrs, breakpoint]
        );

        const {
            style: mirrorStyle,
            any, hasMt, hasMb, hasMl, hasMr, haveFlexDir
        } = useMemo(() => buildMirror(augmented), [augmented, (augmented as any)?.$bp]);

        // Apply !important where the editor forces auto centering etc. 
        useLayoutEffect(() => {
            if (!props.clientId) return;

            const root = document.querySelector<HTMLElement>(`[data-block="${props.clientId}"]`);
            if (!root) return;
        
            // The wrapper itself can be the layout container; fall back to inner if present
            let element: HTMLElement = root;
            if (!element.classList.contains('block-editor-block-list__layout')) {
                element = (root.querySelector(':scope > .block-editor-inner-blocks > .block-editor-block-list__layout') as HTMLElement) || element;
            }

            // Set all mirrored styles with !important
            for (const [key, value] of Object.entries(mirrorStyle)) {
                //Only set known mirrored keys
                if (typeof value !== 'undefined') {
                    const cssProp = 
                        (ATTRS_TO_CSS as Record<string, string>)[key] || 
                        LOGICAL_CSS_PROPS[key] || 
                        key;
                    if (value != null && value !== '') {
                        element.style.setProperty(cssProp, String(value), 'important');
                    } else {
                        element.style.removeProperty(cssProp);
                    }
                }
            }
        }, [
            props.clientId,
            mirrorStyle,
            hasMl, hasMr, haveFlexDir
        ]);

        const className = [
            props?.wrapperProps?.className ?? '',
            any ? 'is-cb-mirrored' : '',
            hasMt ? 'has-cb-mt' : '',
            hasMb ? 'has-cb-mb' : '',
            hasMl ? 'has-cb-ml' : '',
            hasMr ? 'has-cb-mr' : '',
        ].filter(Boolean).join(' ');

        const costeredUid = 
            (augmented as any)?.costeredId || 
            (augmented as any)?.costeredID || 
            (attrs as any)?.costeredId || 
            (attrs as any)?.costeredID || 
            null;

        const wrapperProps = {
            ...(props.wrapperProps || {}),
            className,
            // IMPORTANT: if `any` is false, provide an empty style object to clear old inline styles
            style: any ? { ...(props.wrapperProps?.style || {}), ...mirrorStyle } : {},
            // pass data attribute straight through JSX (React forwards data-* as-is)
            ...(costeredUid ? { ['data-costered']: String(costeredUid) } : {}),
        };

        return <BlockListBlock {...props} wrapperProps={wrapperProps} />;
    });

    Wrapped.displayName = 'CosteredBlocks/EditorSizeMirror';
    return Wrapped;
}

addFilter('editor.BlockListBlock', 'costered-blocks/editor-size-mirror', withEditorStyleMirror, 100);