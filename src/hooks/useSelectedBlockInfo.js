import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { useMemo } from '@wordpress/element';
import { selectActiveBreakpoint } from '@stores/activeBreakpoint.js';
import { augmentAttributes } from '@utils/breakpointUtils.js';

const EMPTY_ATTRS = Object.freeze({});

export function useSelectedBlockInfo() {

    const activeBreakpoint = useSelect(selectActiveBreakpoint, []);

    const { selectedBlock, clientId, attrVersion } = useSelect((select) => {

        const blockEditor = select(blockEditorStore);
        const clientId = blockEditor.getSelectedBlockClientId();
        const block = clientId ? blockEditor.getBlock(clientId) : null;
        
        const attrs = block?.attributes || EMPTY_ATTRS;
        const costered = (attrs && typeof attrs.costered === 'object' && attrs.costered) || {};

        const desktopCount = Object.keys((costered && costered.desktop) || {}).length;
        const tabletCount = Object.keys((costered && costered.tablet) || {}).length;
        const mobileCount = Object.keys((costered && costered.mobile) || {}).length;    

        const version = `${desktopCount}-${tabletCount}-${mobileCount}`;

        return { selectedBlock: block, clientId, attrVersion: version };
    }, []);

    const attributes = useMemo(
        () => (augmentAttributes(selectedBlock?.attributes, activeBreakpoint) || EMPTY_ATTRS),
        [selectedBlock, activeBreakpoint, attrVersion]
    );
    
    return { selectedBlock, clientId, attributes };
}