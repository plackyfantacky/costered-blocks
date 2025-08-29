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
import { PADDING_KEYS, SIZE_KEYS, MISC_KEYS } from '@config';

const hasValue = (v) => v != null && (typeof v !== 'string' || v.trim() !== '');

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
    let hasMt = false;
    let hasMb = false;
    let hasMl = false;
    let hasMr = false;

    //dimensions
    for (const k of SIZE_KEYS) {
        const v = attrs[k];
        if (hasValue(v)) {
            style[k] = String(v);
            any = true;
        }
    }

    // padding
    for (const k of PADDING_KEYS) {
        const v = attrs[k];
        if (hasValue(v)) { style[k] = String(v); any = true; }
    }

    // margin
    // top: also set the logical property so we override blockGap cleanly
    if (hasValue(attrs.marginTop)) {
        const v = String(attrs.marginTop);
        style.marginTop = v;
        style.marginBlockStart = v; // <- beats parent’s blockGap rule
        any = true;
        hasMt = true;
    }

    if (hasValue(attrs.marginBottom)) {
        style.marginBottom = String(attrs.marginBottom);
        any = true;
        hasMb = true;
    }

    // left/right: also set the logical property so we override blockGap cleanly. we also need to add !important to override parent styles
    if (hasValue(attrs.marginLeft)) { style.marginLeft = String(attrs.marginLeft); style.marginInlineStart = String(attrs.marginLeft); any = true; hasMl = true; }
    if (hasValue(attrs.marginRight)) { style.marginRight = String(attrs.marginRight); style.marginInlineEnd = String(attrs.marginRight); any = true; hasMr = true; }

    // misc
    for (const k of MISC_KEYS) {
        const v = attrs[k];
        if (hasValue(v)) {
            style[k] = String(v);
            any = true;
        }
    }

    const haveFlexDir = hasValue(attrs.flexDirection);

    // ensure flexDirection “sticks”
    if (haveFlexDir && !style.display) {
        style.display = 'flex';
        any = true;
    }

    return { style, any, hasMt, hasMb, hasMl, hasMr, haveFlexDir };
}

const cssName = {
    marginLeft: 'margin-left',
    marginRight: 'margin-right',
    marginInlineStart: 'margin-inline-start',
    marginInlineEnd: 'margin-inline-end',
    flexDirection: 'flex-direction',
};

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

            // a little helper to set styles with !important
            function setImportantStyle(el, name, value) {
                if (value != null && value !== '') {
                    el.style.setProperty(name, value, 'important');
                } else {
                    el.style.removeProperty(name);
                }
            }

            const root = document.querySelector(`[data-block="${props.clientId}"]`);
            if (!root) return;

            // The wrapper itself can be the layout container; fall back to inner if present
            let el = root;
            if (!el.classList.contains('block-editor-block-list__layout')) {
                el = root.querySelector(':scope > .block-editor-inner-blocks > .block-editor-block-list__layout') || el;
            }

            setImportantStyle(el, cssName.marginLeft, mirrorStyle.marginLeft);
            setImportantStyle(el, cssName.marginRight, mirrorStyle.marginRight);
            setImportantStyle(el, cssName.marginInlineStart, mirrorStyle.marginInlineStart);
            setImportantStyle(el, cssName.marginInlineEnd, mirrorStyle.marginInlineEnd);

            if (mirrorStyle.flexDirection) {
                setImportantStyle(el, cssName.flexDirection, mirrorStyle.flexDirection);
                if (!el.style.display) el.style.setProperty('display', 'flex', 'important');
            } else {
                el.style.removeProperty(cssName.flexDirection);
            }
        }, [
            props.clientId,
            mirrorStyle.marginLeft,
            mirrorStyle.marginRight,
            mirrorStyle.marginInlineStart,
            mirrorStyle.marginInlineEnd,
            mirrorStyle.flexDirection,
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