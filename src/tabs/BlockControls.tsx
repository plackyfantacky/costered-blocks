import { Panel } from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { getBlockType } from '@wordpress/blocks';
import { store as blockEditorStore } from '@wordpress/block-editor';

import { LABELS } from '@labels';
import { selectActiveBreakpoint } from '@stores/activeBreakpoint';
import { augmentAttributes } from '@utils/breakpointUtils';
import { useParentAttrs } from '@hooks';

import Icon from '@components/Icon';
import NoBlockSelected from "@components/NoBlockSelected";

import type { AugmentedAttributes, BlockUIComponent, BlockUIRenderContext } from '@types';
import type { ReactNode } from '@wordpress/element';

import { InlineSVGBlockUI, INLINE_SVG_BLOCK_NAME } from '@blockUIs/inline-svg';

/* ------------------------------ Registry of Block UI Components ------------------------------ */

const REGISTRY: Readonly<Record<string, BlockUIComponent>> = Object.freeze({
    [INLINE_SVG_BLOCK_NAME]: InlineSVGBlockUI,
});

function getBlockUIForBlockName(blockName: string | null): BlockUIComponent | null {
    if (!blockName) return null;
    return REGISTRY[blockName] ?? null;
}

function hasBlockUI(blockName: string | null): boolean {
    if (!blockName) return false;
    return Object.prototype.hasOwnProperty.call(REGISTRY, blockName);
}

/* ------------------------------ Selected Block Icon ------------------------------ */

function SelectedBlockIcon() {
    const blockname = useSelect((select: any) => {
        const editor = select(blockEditorStore);
        return editor.getSelectedBlock()?.name || null;
    }, []);

    const rawIcon = blockname ? getBlockType(blockname)?.icon : null;

    return <Icon icon={rawIcon as any} size={24} />;
}

/* ------------------------------ BlockControls Component ------------------------------ */

const EMPTY_ATTRS: Readonly<Record<string, never>> = Object.freeze({});

function BlockControlsTabBody() {
    const { clientId, name, attributes } = useSelect((select: any) => {
        const editor = select(blockEditorStore);
        const selected = editor.getSelectedBlock();
        return selected ? {
            clientId: String(selected.clientId),
            name: String(selected.name),
            attributes: ( selected.attributes || EMPTY_ATTRS ) as Record<string, unknown>

        } : {
            clientId: null,
            name: null,
            attributes: EMPTY_ATTRS
        }
    }, []);

    const activeBreakpoint = useSelect(selectActiveBreakpoint, []);
    const { parentAttrs } = useParentAttrs(undefined);

    const augmentedAttributes = useMemo<AugmentedAttributes>(
        () => augmentAttributes(attributes as any, activeBreakpoint as any),
        [attributes, activeBreakpoint]
    );

    if (!clientId || !name) return (
        <NoBlockSelected />
    );

    const BlockUI = getBlockUIForBlockName(name);

    if (!BlockUI) return (
        <NoBlockSelected message={
            <>
                <p style={{ marginTop: 0 }}>
                    No Block UI registered for <code>{name}</code>.
                </p>
                <p style={{ marginBottom: 0 }}>
                    Registry keys: <code>{Object.keys(REGISTRY).join(', ') || '(empty)'}</code>
                </p>
            </>
        } />
    );

    const context: BlockUIRenderContext = {
        clientId,
        name,
        attributes,
        augmentedAttributes,
        parentAttrs
    };

    console.log({ name, keys: Object.keys(REGISTRY), has: !!BlockUI });

    return (
        <Panel className="costered-blocks--tab--block-controls">
            <BlockUI {...context} />
        </Panel>
    );
}

export default {
    name: 'block-controls',
    title: (LABELS.blockControls?.tabTitle as ReactNode) ?? 'Block Controls',
    icon: <SelectedBlockIcon />,
    render: BlockControlsTabBody,
    isVisible: ({ blockName }: { blockName: string | null }) => hasBlockUI(blockName)
}