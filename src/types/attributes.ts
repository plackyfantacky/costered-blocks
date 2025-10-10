import type { CSSPrimitive } from "./index";
import type { Breakpoint, BreakpointBucket } from "./breakpoints";

export type CosteredAttributes = Partial<Record<Breakpoint, BreakpointBucket>>;

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