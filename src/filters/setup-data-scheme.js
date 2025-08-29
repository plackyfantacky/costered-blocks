import { addFilter } from '@wordpress/hooks';
import { COSTERED_LAYOUT_SCHEMA } from '@config'; // Adjust the import path as necessary

addFilter('blocks.registerBlockType', 'costered-blocks/setup-data-schema', (settings) => ({
    ...settings,
    attributes: {
        ...settings.attributes,
        ...COSTERED_LAYOUT_SCHEMA
    }
}));
