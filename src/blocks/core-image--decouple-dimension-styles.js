import { addFilter } from '@wordpress/hooks';

addFilter('blocks.registerBlockType', 'costered-blocks/core-image--style-attributes', (settings, name) => {
    if (name !== 'core/image') return settings;
    return {
        ...settings,
        attributes: {
            ...settings.attributes,
            style: {
                type: 'object',
                default: {},
            }
        }
    };
});