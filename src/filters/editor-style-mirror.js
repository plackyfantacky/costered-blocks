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

import { augmentAttributes } from '@utils/breakpointUtils';
import { selectActiveBreakpoint } from '@stores/activeBreakpoint.js';

import {
    MIRRORED_STYLE_KEYS,
    ATTRS_TO_CSS,
    gridItemsProps,
} from '@config';

//console.log('MIRRORED_STYLE_KEYS', MIRRORED_STYLE_KEYS)

// helpers
const kebabToCamel = (value) => value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
const hasNonEmptyString = (input) => {
    if (input === undefined || input === null) return false;
    const output = String(input).trim();
    return output !== '' && output !== 'undefined' && output !== 'null';
};

// Logical CSS properties for margin overrides (to beat blockGap)
const LOGICAL_CSS_PROPS = {
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
const keys = Object.keys(gridItemsProps || {});
const PLACEMENT = {};
for (const key of keys) {
    PLACEMENT[key] = {
        css: gridItemsProps[key]?.css || key,
        attr: kebabToCamel(gridItemsProps[key]?.css || key)
    };
}

/**
 * Build a style object from block attributes.
 *
 * Iterates over dimension, spacing, and layout keys, converting attribute values into valid 
 * inline styles. Also sets logical margin properties to override blockGap and returns flags 
 * for which sides are set.
 * 
 * @param {Object} attributes - Block attributes to process.
 * @returns {Object} An object containing:
 *   - style: The constructed style object.
 *   - any: Boolean indicating if any styles were set.
 *   - hasMt, hasMb, hasMl, hasMr: Booleans indicating if specific margins are set.
 *   - haveFlexDir: Boolean indicating if flexDirection is set
 */
function buildMirror(attributes = {}) {
    // prefer responsive-aware reads (raw per active breakpoint); fallback to legacy props (if any left)
    const read = (key) => (
        typeof attributes?.$get === 'function'
            ? attributes.$get(key)
            : attributes?.[key]
    );

    const style = {};
    let any = false;


    // Track which margin sides are set for class flags
    let hasMt = false, hasMb = false, hasMl = false, hasMr = false;

    // margin top
    if (hasNonEmptyString(read('marginTop'))) {
        const value = String(read('marginTop'));
        style.marginTop = value;
        style.marginBlockStart = value; // <- beats parent’s blockGap rule
        any = true;
        hasMt = true;
    }

    // margin bottom
    if (hasNonEmptyString(read('marginBottom'))) {
        const value = String(read('marginBottom'));
        style.marginBottom = value;
        style.marginBlockEnd = value; // <- beats parent’s blockGap rule
        any = true;
        hasMb = true;
    }

    // margin left
    if (hasNonEmptyString(read('marginLeft'))) {
        const value = String(read('marginLeft'));
        style.marginLeft = value;
        style.marginInlineStart = value; // <- beats parent’s blockGap rule
        any = true;
        hasMl = true;
    }

    // margin right
    if (hasNonEmptyString(read('marginRight'))) {
        const value = String(read('marginRight'));
        style.marginRight = value;
        style.marginInlineEnd = value; // <- beats parent’s blockGap rule
        any = true;
        hasMr = true;
    }

    // zIndex
    if (hasNonEmptyString(read('zIndex'))) {
        const value = Number(read('zIndex'));
        style.zIndex = value;
        any = true;
    }

    // grid shorthands
    const area = String(read(PLACEMENT.gridArea.attr) || '').trim();
    if (area && !area.includes('/') && !/\bspan\b/i.test(area)) { style[PLACEMENT.gridArea.attr] = area; any = true; }

    //grid column
    const col = (read(PLACEMENT.gridColumn.attr) || '').trim();
    if (col) { style[PLACEMENT.gridColumn.attr] = col; any = true; }

    //grid row
    const row = (read(PLACEMENT.gridRow.attr) || '').trim();
    if (row) { style[PLACEMENT.gridRow.attr] = row; any = true; }

    // All other mirrored style keys (skip margins and grid shorthands already handled)
    for (const key of MIRRORED_STYLE_KEYS) {
        if (
            key === 'marginTop' || key === 'marginBottom' ||
            key === 'marginLeft' || key === 'marginRight' ||
            key === 'zIndex' || key === 'z-index' ||
            key === PLACEMENT.gridArea.attr || key === PLACEMENT.gridColumn.attr || key === PLACEMENT.gridRow.attr
        ) continue;
        const value = read(key);
        if (hasNonEmptyString(value)) {
            style[key] = String(value);
            any = true;
        }
    }

    // has flexDirection: ensure display:flex is set if it is
    // ensure flexDirection “sticks”
    const haveFlexDir = hasNonEmptyString(read('flexDirection'));
    if (haveFlexDir && !style.display) {
        style.display = 'flex';
        any = true;
    }

    // drop any empty/"undefined"/"null" strings from style
    Object.keys(style).forEach((key) => {
        if (!hasNonEmptyString(style[key])) {
            delete style[key];
        } else {
            // normalise strings in-place (trim)
            style[key] = String(style[key]).trim();
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
 * 
 * @param {Function} BlockListBlock - The original BlockListBlock component.
 * @returns {Function} A memoized component that applies the style mirror.
 */
function withEditorStyleMirror(BlockListBlock) {
    const Wrapped = memo((props) => {
        const block = useSelect(
            (select) => (props.clientId ? select('core/block-editor').getBlock(props.clientId) : null),
            [props.clientId]
        );
        const attrs = block?.attributes || {};
        const breakpoint = useSelect(selectActiveBreakpoint, []);
        const augmented = useMemo(() => augmentAttributes(attrs, breakpoint), [attrs, breakpoint]);

        const {
            style: mirrorStyle,
            any, hasMt, hasMb, hasMl, hasMr, haveFlexDir
        } = useMemo(() => buildMirror(augmented), [augmented, augmented?.$bp]);

        // Apply !important where the editor forces auto centering etc. 
        useLayoutEffect(() => {
            if (!props.clientId) return;

            const root = document.querySelector(`[data-block="${props.clientId}"]`);
            if (!root) return;

            // The wrapper itself can be the layout container; fall back to inner if present
            let el = root;
            if (!el.classList.contains('block-editor-block-list__layout')) {
                el = root.querySelector(':scope > .block-editor-inner-blocks > .block-editor-block-list__layout') || el;
            }

            // Set all mirrored styles with !important
            for (const [key, value] of Object.entries(mirrorStyle)) {
                //Only set known mirrored keys
                if (typeof value !== 'undefined') {
                    const cssProp = ATTRS_TO_CSS[key] || LOGICAL_CSS_PROPS[key] || key;
                    if (value != null && value !== '') {
                        el.style.setProperty(cssProp, value, 'important');
                    } else {
                        el.style.removeProperty(cssProp);
                    }
                }
            }
        }, [
            props.clientId,
            mirrorStyle,
            hasMl, hasMr, haveFlexDir
        ]);

        const className = [
            props?.wrapperProps?.className || '',
            any ? 'is-cb-mirrored' : '',
            hasMt ? 'has-cb-mt' : '',
            hasMb ? 'has-cb-mb' : '',
            hasMl ? 'has-cb-ml' : '',
            hasMr ? 'has-cb-mr' : '',
        ].filter(Boolean).join(' ');

        const costeredUid = augmented?.costeredId || augmented?.costeredID || attrs?.costeredId || attrs?.costeredID || null;

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