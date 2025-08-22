import { useSelect } from '@wordpress/data';

export function useSelectedBlockInfo() {
    return useSelect((select) => {
        const editor = select('core/block-editor');
        const clientId = editor.getSelectedBlockClientId();
        const block = clientId ? editor.getBlock(clientId) : null;
        return { selectedBlock: block, clientId };
    }, []);
}
