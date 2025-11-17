import type { CSSPrimitive } from "./index";
import type { Breakpoint, BreakpointBucket } from "./breakpoints";

export type CosteredAttributes = {
    desktop: BreakpointBucket;
    tablet: BreakpointBucket;
    mobile: BreakpointBucket;
};

export interface BlockAttributes {
    costered?: CosteredAttributes;
    costeredId?: string;
    [key: string]: unknown;
}

export type CascadeOptions = { cascade?: boolean; raw?: boolean };

// Non-generic augmented attributes surface used throughout the editor
export type AugmentedAttributes = BlockAttributes & {
    $get: (key: string, options?: CascadeOptions) => CSSPrimitive | undefined;
    $getCascade: (key: string) => CSSPrimitive | undefined;
    $getMany: (keys: ReadonlyArray<string>, options?: CascadeOptions) => Record<string, CSSPrimitive | undefined>;
    $bp: Breakpoint;
};

export type UnsavedAttr = {
    attr: string;
    id: string;
    source?: string;
}