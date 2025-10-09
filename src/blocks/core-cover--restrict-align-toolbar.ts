import { addFilter } from '@wordpress/hooks';
import type { BlockConfiguration } from '@wordpress/blocks';


function restrictCoreCoverAlignSupport(settings: BlockConfiguration, name?: string): BlockConfiguration {
    if (name !== 'core/cover') return settings;

    const supports = (settings.supports as Record<string, unknown> | undefined) ?? {};

    const allowedAlignments = ['wide', 'full'] as const;

    return {
        ...settings,
        supports: {
            ...supports,
            align: allowedAlignments,
        }
    } as BlockConfiguration;
}

addFilter(
    'blocks.registerBlockType',
    'costered-blocks/core-cover--restrict-align-toolbar',
    restrictCoreCoverAlignSupport
);
