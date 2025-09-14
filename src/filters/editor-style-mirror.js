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
 * - withCosteredMirror(BlockListBlock):
 *     A Higher-Order Component (HOC) that wraps Gutenberg’s BlockListBlock.
 *     It uses `useSelect` to grab the current block’s attributes, runs them
 *     through `buildMirror`, and merges the result into the block’s wrapperProps.
 *     This ensures the editor preview updates live as attributes change,
 *     without extra re-renders or manual MutationObservers.
 */

import { addFilter } from '@wordpress/hooks';
import { useSelect } from '@wordpress/data';
import { memo, useLayoutEffect, useMemo } from '@wordpress/element';
import { MIRRORED_STYLE_KEYS, ATTRS_TO_CSS } from '@config';

const LOGICAL_CSS_PROPS = {
    marginInlineStart: 'margin-inline-start',
    marginInlineEnd: 'margin-inline-end',
    marginBlockStart: 'margin-block-start',
    marginBlockEnd: 'margin-block-end',
};


const hasValue = (v) => v != null && (typeof v !== 'string' || v.trim() !== '');
const pick = (v) => (v == null ? '' : String(v).trim());

/**
 * Build a style object from block attributes.
 *
 * Iterates over dimension, spacing, and layout keys, converting attribute values into valid 
 * inline styles. Also sets logical margin properties to override blockGap and returns flags 
 * for which sides are set.
 * 
 * @param {Object} attrs - Block attributes to process.
 * @returns {Object} An object containing:
 *   - style: The constructed style object.
 *   - any: Boolean indicating if any styles were set.
 *   - hasMt, hasMb, hasMl, hasMr: Booleans indicating if specific margins are set.
 *   - haveFlexDir: Boolean indicating if flexDirection is set
 */
function buildMirror(attrs = {}) {
    const style = {};
    let any = false;


    // Track which margin sides are set for class flags
    let hasMt = false, hasMb = false, hasMl = false, hasMr = false;

    // margin top
    if (hasValue(attrs.marginTop)) {
        const value = String(attrs.marginTop);
        style.marginTop = value;
        style.marginBlockStart = value; // <- beats parent’s blockGap rule
        any = true;
        hasMt = true;
    }

    // margin bottom
    if (hasValue(attrs.marginBottom)) {
        const value = String(attrs.marginBottom);
        style.marginBottom = value;
        style.marginBlockEnd = value; // <- beats parent’s blockGap rule
        any = true;
        hasMb = true;
    }

    // margin left
    if (hasValue(attrs.marginLeft)) {
        const value = String(attrs.marginLeft);
        style.marginLeft = value;
        style.marginInlineStart = value; // <- beats parent’s blockGap rule
        any = true;
        hasMl = true;
    }

    // margin right
    if (hasValue(attrs.marginRight)) {
        const value = String(attrs.marginRight);
        style.marginRight = value;
        style.marginInlineEnd = value; // <- beats parent’s blockGap rule
        any = true;
        hasMr = true;
    }

    // grid shorthands
    // grid area
    const area = String(attrs.gridArea || '').trim();
    if (area && !area.includes('/') && !/\bspan\b/i.test(area)) {
        style.gridArea = area;
        any = true;
    }

    //grid column
    const col = (attrs.gridColumn || '').trim();
    if (col) { style.gridColumn = col; any = true; }

    //grid row
    const row = (attrs.gridRow || '').trim();
    if (row) { style.gridRow = row; any = true; }

    // All other mirrored style keys (skip margins and grid shorthands already handled)
    for (const key of MIRRORED_STYLE_KEYS) {
        if (
            key === 'marginTop' || key === 'marginBottom' ||
            key === 'marginLeft' || key === 'marginRight' ||
            key === 'gridArea' || key === 'gridColumn' || key === 'gridRow'
        ) continue;
        const value = attrs[key];
        if (hasValue(value)) {
            style[key] = String(value);
            any = true;
        }
    }

    // has flexDirection: ensure display:flex is set if it is
    // ensure flexDirection “sticks”
    const haveFlexDir = hasValue(attrs.flexDirection);
    if (haveFlexDir && !style.display) {
        style.display = 'flex';
        any = true;
    }

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
function withCosteredMirror(BlockListBlock) {
    const Wrapped = memo((props) => {
        const block = useSelect(
            (sel) => (props.clientId ? sel('core/block-editor').getBlock(props.clientId) : null),
            [props.clientId]
        );
        const attrs = block?.attributes || {};

        const {
            style: mirrorStyle,
            any, hasMt, hasMb, hasMl, hasMr, haveFlexDir
        } = useMemo(() => buildMirror(attrs), [attrs]);

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

            // a little helper to set styles with !important
            function setImportantStyle(el, attrKey, value) {
                const cssProp = ATTRS_TO_CSS[attrKey] || LOGICAL_CSS_PROPS[attrKey] || attrKey;
                if (value != null && value !== '') {
                    el.style.setProperty(cssProp, value, 'important');
                } else {
                    el.style.removeProperty(cssProp);
                }
            }

            // Set all mirrored styles with !important
            for (const [key, value] of Object.entries(mirrorStyle)) {
                //Only set known mirrored keys
                if (typeof value !== 'undefined') {
                    const cssProp = ATTRS_TO_CSS[key] || LOGICAL_CSS_PROPS[key] || key;
                    if(value != null && value !== '') {
                        el.style.setProperty(cssProp, value, 'important');
                    } else {
                        el.style.removeProperty(cssProp);
                    }
                }
            }

                    
            // setImportantStyle(el, 'marginInlineStart', mirrorStyle.marginInlineStart);
            // setImportantStyle(el, 'marginInlineEnd', mirrorStyle.marginInlineEnd);
            // setImportantStyle(el, 'marginBlockStart', mirrorStyle.marginBlockStart);
            // setImportantStyle(el, 'marginBlockEnd', mirrorStyle.marginBlockEnd);

            // if (mirrorStyle.flexDirection) {
            //     setImportantStyle(el, 'flexDirection', mirrorStyle.flexDirection);
            //     if (!el.style.display) el.style.setProperty('display', 'flex', 'important');
            // } else {
            //     el.style.removeProperty(ATTRS_TO_CSS['flexDirection'] || 'flex-direction');
            // }
        }, [
            props.clientId,
            // mirrorStyle.marginInlineStart,
            // mirrorStyle.marginInlineEnd,
            // mirrorStyle.marginBlockStart,
            // mirrorStyle.marginBlockEnd,
            // mirrorStyle.flexDirection,
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

        const wrapperProps = {
            ...(props.wrapperProps || {}),
            className,
            // IMPORTANT: if `any` is false, provide an empty style object to clear old inline styles
            style: any ? { ...(props.wrapperProps?.style || {}), ...mirrorStyle } : {},
        };

        return <BlockListBlock {...props} wrapperProps={wrapperProps} />;
    });

    Wrapped.displayName = 'CosteredBlocks/EditorSizeMirror';
    return Wrapped;
}

addFilter('editor.BlockListBlock', 'costered-blocks/editor-size-mirror', withCosteredMirror, 100);