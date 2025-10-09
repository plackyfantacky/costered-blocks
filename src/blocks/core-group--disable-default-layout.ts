import { getBlockVariations, unregisterBlockVariation, type BlockConfiguration } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';
import domReady from '@wordpress/dom-ready';

// Disable layout controls for specific blocks
const TARGETS = new Set<string>(['core/group', 'core/columns', 'core/buttons']);

function withDisabledLayoutSupport(
    settings: BlockConfiguration,
    name?: string
): BlockConfiguration {
    if (!name || !TARGETS.has(name)) return settings;

    const supports = (settings.supports as Record<string, unknown> | undefined) ?? {};

    return {
        ...settings,
        supports: {
            ...supports,
            align: false, // Disable alignment controls
            layout: false, // Disable layout controls
        }
    } as BlockConfiguration;
}

addFilter(
    'blocks.registerBlockType',
    'costered-blocks/disable-layout',
    withDisabledLayoutSupport
);

// --- Variations cleanup -----------------------------------------------------

type VariationLike = { name: string; isDefault?: boolean };

function unregisterBlockVariations() {
    const list = (getBlockVariations('core/group') ?? []) as VariationLike[];
    for (let i = 0; i < list.length; i++) {
        const v = list[i]!;
        if (!v.isDefault) unregisterBlockVariation('core/group', v.name);
    }
}

domReady(() => {
    //remove every non "Group" variation from the group block
    unregisterBlockVariations();

    //hunter/killer for any rogue group block variations or registrations
    setTimeout(() => {
        unregisterBlockVariations();
    }, 0);
});