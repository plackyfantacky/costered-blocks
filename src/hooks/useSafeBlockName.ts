import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

/**
 * Returns a reliable blockName for scoping prefs.
 * - If `providedBlockName` exists, it wins.
 * - Else, uses `providedClientId` or the currently selected block.
 */
export function useSafeBlockName(
    providedBlockName: string | null,
    providedClientId: string | null
): string | null {
    return useSelect((select: any) => {
        if (providedBlockName && providedBlockName.trim() !== '') return providedBlockName;

        const be = select(blockEditorStore);
        const id: string | undefined =
            (providedClientId as string | undefined) || be?.getSelectedBlockClientId?.();
        const block = id ? be?.getBlock?.(id) : null;

        return (block?.name as string | undefined) ?? null;
    }, [providedBlockName, providedClientId]);
}
