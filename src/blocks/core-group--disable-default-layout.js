import { getBlockVariations, unregisterBlockVariation } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';
import domReady from '@wordpress/dom-ready';

// Disable layout controls for specific blocks
const TARGETS = new Set(['core/group', 'core/columns', 'core/buttons']);

addFilter('blocks.registerBlockType', 'costered-blocks/disable-layout', (settings, name) => {
    if (!TARGETS.has(name)) return settings;
    return {
        ...settings,
        supports: {
            ...(settings.supports || {}),
            align: false, // Disable alignment controls
            layout: false, // Disable layout controls
        }
    };
}, 10);

domReady(() => {
    //remove every non "Group" variation from the group block

    function unregisterBlockVariations() {
        (getBlockVariations('core/group') || []).forEach(v => {
            if (!v.isDefault) {
                unregisterBlockVariation('core/group', v.name);
            };
        });
    }

    unregisterBlockVariations();

    //hunter/killer for any rogue group block variations or registrations
    setTimeout(() => {
        unregisterBlockVariations();
    }, 0);
});