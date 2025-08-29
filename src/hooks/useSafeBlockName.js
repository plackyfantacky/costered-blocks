import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

/**
 * Returns a reliable blockName for scoping prefs.
 * - If `providedBlockName` exists, it wins.
 * - Else, uses `providedClientId` or the currently selected block.
 */
export function useSafeBlockName(providedBlockName, providedClientId) {
    return useSelect((select) => {
        if (providedBlockName) return providedBlockName;

        const be = select(blockEditorStore);
        const id = providedClientId || be.getSelectedBlockClientId();
        const block = id ? be.getBlock(id) : null;

        return block?.name ?? null;
    }, [providedBlockName, providedClientId]);
}
