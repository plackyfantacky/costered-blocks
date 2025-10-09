import { addFilter } from '@wordpress/hooks';
import type { BlockConfiguration } from '@wordpress/blocks';

function withDecoupledDimensionStyles(
    settings: BlockConfiguration,
    name?: string
): BlockConfiguration {
    if (name !== 'core/image') return settings;

    const supports = (settings.supports as Record<string, unknown> | undefined) ?? {};

    return {
        ...settings,
        supports: {
            ...supports,
            style: true,
        },
    } as BlockConfiguration;
}

addFilter(
    'blocks.registerBlockType',
    'costered-blocks/core-image--style-attributes', 
    withDecoupledDimensionStyles
);