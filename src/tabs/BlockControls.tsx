import { Panel } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { getBlockType } from '@wordpress/blocks';
import { store as blockEditorStore } from '@wordpress/block-editor';

import { LABELS } from '@labels';

import Icon from '@components/Icon';
import NoBlockSelected from "@components/NoBlockSelected";
import CosteredBlockControls from '@utils/slotFillUtils';

import type { ReactNode } from '@wordpress/element';

function SelectedBlockIcon() {
    const blockname = useSelect((select: any) => {
        const editor = select(blockEditorStore);
        return editor.getSelectedBlock()?.name || null;
    }, []);

    const rawIcon = blockname ? getBlockType(blockname)?.icon : null;

    return <Icon icon={rawIcon as any} size={24} />;
}

function BlockControlsTabBody() {
    const { clientId, name } = useSelect((select: any) => {
        const editor = select(blockEditorStore);
        const selected = editor.getSelectedBlock();
        return selected ? {
            clientId: String(selected.clientId),
            name: String(selected.name)
        } : {
            clientId: null,
            name: null
        };
    }, []);

    if (!clientId || !name) return (
        <NoBlockSelected />
    );

    return (
        <Panel className="costered-blocks--tab--block-controls">
            <CosteredBlockControls.Slot />
        </Panel>
    );
}

export default {
    name: 'block-controls',
    title: (LABELS.blockControls?.tabTitle as ReactNode) ?? 'Block Controls',
    icon: <SelectedBlockIcon />,
    render: BlockControlsTabBody,
    isVisible: ({ blockName }: { blockName: string | null }) => !!blockName
}