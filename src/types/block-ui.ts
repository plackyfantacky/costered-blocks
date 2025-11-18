// src/types/ui-controls.ts
import type { AugmentedAttributes } from '@types';
import type { ComponentType } from '@wordpress/element';

export type BlockUIRenderContext = {
    clientId: string;
    name: string;
    attributes: Record<string, unknown>;
    augmentedAttributes: AugmentedAttributes;
    parentAttrs: Record<string, unknown> | null;
};

// No JSX in the signature:
export type BlockUIComponent = ComponentType<BlockUIRenderContext>;