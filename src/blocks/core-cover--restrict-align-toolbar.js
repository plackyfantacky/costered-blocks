import { addFilter } from '@wordpress/hooks';

function restrictCoreCoverAlignSupport(settings, name) {
    if (name !== 'core/cover') return settings;

    return {
        ...settings,
        supports: {
            ...settings.supports,
            align: ['wide', 'full'] // disables left/right/center
        }
    };
}

addFilter('blocks.registerBlockType', 'costered-blocks/core-cover--restrict-align-toolbar', restrictCoreCoverAlignSupport);
