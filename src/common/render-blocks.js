import { addFilter } from '@wordpress/hooks';
import { useSelect } from '@wordpress/data';
import { memo, useMemo } from '@wordpress/element';

import {
    displayProps,
    dimensionProps,
    marginProps,
    paddingProps
} from '@lib/schema';

const ALLOWED = [
    ...Object.keys(displayProps),
    ...Object.keys(dimensionProps),
    ...Object.keys(marginProps),
    ...Object.keys(paddingProps)
];

/**
 * MutationObserver to watch for changes in the block editor. For anyone reading this and are curious as to what we're doing, continue reading.
 * 
 * The WP Block Editor/Gutenberg doesn't display block attributes (the 'attrs') in the markup inside the block editor. What it does instead is
 * it assigns each block a clientID (stored in the data-block attribute e.g data-block="9e4ed1fc-c9e9-4196-8730-b42c36a57c00"). The clientID
 * corresponds to a data object within the global data store. That data object has all of the block data attributes needed to render our style
 * attributes.
 * 
 * Becuase of this we need to watch the HTML dom for changes (new blocks being added/edited/removed) AND subscribe to the block data store for changes.
 * (TODO: expand this explanation more later)
 * 
 * The parts of this moving machine:
 * - updateBlockStyles() - handles the attribute lookup and style injection
 * - observer - a MutationObserver that watches for changes in the editor DOM
 * - subscribe - a WP hook that listens for changes in javascript object and act accordingly.
 * 
 * both observer and subscibe run updateBlockStyles
 */

function camelToKebab(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function findStyleTarget(blockEl, blockName) {
    const containerBlocks = ['core/group', 'core/columns', 'core/column', 'core/cover', 'core/media-text'];
    if (containerBlocks.includes(blockName)) return blockEl;


    // If this element is a block editor editable (e.g. <p>), style it directly
    if (
        blockEl.classList.contains('block-editor-rich-text__editable') ||
        blockEl.classList.contains('wp-block-paragraph') ||
        blockEl.classList.contains('wp-block-heading')
    ) {
        return blockEl;
    }

    const editable = blockEl.querySelector('.block-editor-rich-text__editable');
    if (editable) return editable;
    if (blockEl.firstElementChild) return blockEl.firstElementChild;
    return null;
}

// find all blocks in the editor DOM
const allBlocks = document.querySelectorAll('[data-block]');
if (allBlocks.length > 0) {
    console.log(`Found ${allBlocks.length} blocks in the editor.`);
    allBlocks.forEach(blockEl => {
        console.log('Found block element:', blockEl.id);
    });
}

function updateBlockStyles() {
    const { select } = window.wp.data;
    const blocks = select('core/block-editor').getBlocks();

    document.querySelectorAll('[data-block]').forEach(blockEl => {
        //pick a block, any block... (not really, actually do this for every block).
        const match = blockEl.id && blockEl.id.match(/^block-(.+)$/);
        if (!match) return;

        //find the corresponding (data-store) block in the blocks array
        const clientId = match[1];
        const block = blocks.find(b => b.clientId === clientId);
        if (!block || !block.attributes) return;

        // now we have the block, we can loop through the attributes and apply styles
        let styleString = '';
        //we cycle through our entries only, leaving other attributes alone
        ALLOWED.forEach(attrKey => {
            const value = block.attributes[attrKey];
            if (value) styleString += `${camelToKebab(attrKey)}: ${value};`;
        });

        // inject/overwrite the style attribute
        const blockName = block?.name || '';
        const target = findStyleTarget(blockEl, blockName);

        if (target) {
            if (styleString) {
                target.style.cssText = styleString;
            } else {
                //clean up old styles if attribute is removed
                ALLOWED.forEach(attrKey => {
                    target.style.removeProperty(camelToKebab(attrKey));
                });

            }
        }
    });
}


// MutationObserver to watch for changes in the block editor
document.addEventListener('DOMContentLoaded', () => {
    const root = document.body; // works in both iframe and inline contexts
    const mo = new MutationObserver(updateBlockStyles);
    mo.observe(root, { childList: true, subtree: true });

    // Initial run for present blocks
    updateBlockStyles();
});

// Subscribe to changes in the block data store
const { subscribe } = window.wp.data;
let lastAttrs = {};

subscribe(() => {
    const blocks = window.wp.data.select('core/block-editor').getBlocks();
    const attrJSON = JSON.stringify(blocks.map(b => b.attributes));
    if (attrJSON !== lastAttrs.json) {
        lastAttrs.json = attrJSON;
        updateBlockStyles();
    }
});

// Filter to add inline styles based on block attributes. Currently only applies to blocks registered by this plugin.
addFilter(
    'blocks.getBlockProps',
    'costered-blocks/add-inline-styles',
    (props, blockType, attributes) => {
        const style = { ...(props.style || {}) };
        ALLOWED.forEach(attrKey => {
            if (attributes[attrKey]) style[camelToKebab(attrKey)] = attributes[attrKey];
        });
        if (Object.keys(style).length > 0) props.style = style;
        return props;
    }
);

// AND even then, all of the above isn't enough. Some styles/attributes just can't be tamed by the above methods.
// For those, we use a custom editor stylesheet.

const PADDING_KEYS = ['padding','paddingTop','paddingRight','paddingBottom','paddingLeft'];
const MARGIN_KEYS  = ['margin','marginTop','marginRight','marginBottom','marginLeft'];
const SIZE_KEYS = [ 'width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight' ];

const hasValue = (v) => v != null && (typeof v !== 'string' || v.trim() !== '');

function buildMirror(attrs = {}) {
    const style = {};
    let any = false;
    let hasMt = false;
    let hasMb = false;

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

    return { style, any, hasMt, hasMb };
}

function withCosteredMirror(BlockListBlock) {
    const Wrapped = memo((props) => {
        const block = useSelect(
            (sel) => (props.clientId ? sel('core/block-editor').getBlock(props.clientId) : null),
            [props.clientId]
        );
        const attrs = block?.attributes || {};

        const { style, any, hasMt, hasMb } = useMemo(() => buildMirror(attrs), [attrs]);

        const className = [
            props?.wrapperProps?.className || '',
            any ? 'is-cb-mirrored' : '',
            hasMt ? 'has-cb-mt' : '',
            hasMb ? 'has-cb-mb' : '',
        ].filter(Boolean).join(' ');

        const wrapperProps = {
            ...(props.wrapperProps || {}),
            className,
            // IMPORTANT: if `any` is false, provide an empty style object to clear old inline styles
            style: any ? { ...(props.wrapperProps?.style || {}), ...style } : {},
        };

        return <BlockListBlock {...props} wrapperProps={wrapperProps} />;
    });

    Wrapped.displayName = 'CosteredBlocks/EditorSizeMirror';
    return Wrapped;
}

addFilter('editor.BlockListBlock', 'costered-blocks/editor-size-mirror', withCosteredMirror, 100);