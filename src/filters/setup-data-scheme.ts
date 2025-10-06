import { addFilter } from '@wordpress/hooks';
import { COSTERED_ATTRIBUTE_SHAPE} from '@config'; // Adjust the import path as necessary

addFilter(
    'blocks.registerBlockType',
    'costered-blocks/setup-data-schema', (settings) => {
        settings.attributes = settings.attributes || {};
        if (!settings.attributes.costered) {
            settings.attributes.costered = COSTERED_ATTRIBUTE_SHAPE;
            settings.attributes.costeredId = { type: 'string' };
        }
        return settings;
    }
);
