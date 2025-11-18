import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useMemo } from '@wordpress/element';


import type { Breakpoint, BlockAttributes, AugmentedAttributes } from '@types';
import { selectActiveBreakpoint } from '@stores/activeBreakpoint';
import { augmentAttributes } from '@utils/breakpointUtils';

const EMPTY_ATTRS: BlockAttributes = Object.freeze({});

type Result = {
    selectedBlock: any | null;
    clientId: string | null;
    attributes: AugmentedAttributes;
}

export function useSelectedBlockInfo(): Result {

    const activeBreakpoint = useSelect(selectActiveBreakpoint, []) as Breakpoint | undefined;

    const { selectedBlock, clientId, attrVersion } = useSelect((select: any) => {
        const blockEditor = select(blockEditorStore);

        const clientId: string | null = blockEditor?.getSelectedBlockClientId?.();
        const block = clientId ? blockEditor?.getBlock?.(clientId) : null;
        
        const attrs: BlockAttributes = (block?.attributes as BlockAttributes) ?? EMPTY_ATTRS;
        const costered = (attrs?.costered as any) ?? {};

        const desktopCount = Array.isArray(costered?.desktop?.styles) ? costered.desktop.styles.length : 0;
        const tabletCount = Array.isArray(costered?.tablet?.styles) ? costered.tablet.styles.length : 0;
        const mobileCount = Array.isArray(costered?.mobile?.styles) ? costered.mobile.styles.length : 0;

        const version = `${desktopCount}-${tabletCount}-${mobileCount}`;

        return { selectedBlock: block, clientId, attrVersion: version };
    }, []);

    const attributes = useMemo<AugmentedAttributes>(() => {
        const base = (selectedBlock?.attributes as BlockAttributes) ?? EMPTY_ATTRS;
        return augmentAttributes(base, activeBreakpoint as Breakpoint) || EMPTY_ATTRS;
    }, [selectedBlock, activeBreakpoint, attrVersion]);

    return { selectedBlock, clientId, attributes };
}