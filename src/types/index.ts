// Basic primitives
export type Breakpoint = 'desktop' | 'tablet' | 'mobile';
export type CSSPrimitive = string | number;

/**
 * Normalised declaration used internally by helpers/UI.
 */
export interface StyleDeclaration {
    property: string;
    value: CSSPrimitive;
    important?: boolean;
}


// non-readonly tuples
type RawTuple2 = [property: string, value: CSSPrimitive] | readonly [property: string, value: CSSPrimitive];
type RawTuple3 = [property: string, value: CSSPrimitive, important: boolean] | readonly [property: string, value: CSSPrimitive, important: boolean];

/**
 * What might be stored on disk today. We keep this loose to
 * accept either tuples or objects while we're refactoring.
 */
export type RawStyle = | StyleDeclaration | RawTuple2 | RawTuple3;

export type CosteredBreakpoint = { styles: RawStyle[] };
export type CosteredAttributes = {
    desktop?: CosteredBreakpoint;
    tablet?: CosteredBreakpoint;
    mobile?: CosteredBreakpoint;
};

export interface BlockAttributes {
    costered?: CosteredAttributes;
    costeredId?: string;
    [key: string]: unknown;
}

export interface BreakpointBucket {
    styles: RawStyle[]; // raw wire format
}

// Reader options shared across hooks
export type CascadeOptions = { cascade?: boolean; raw?: boolean };

// Non-generic augmented attributes surface used throughout the editor
export type AugmentedAttributes = BlockAttributes & {
    $get: (key: string, options?: CascadeOptions) => CSSPrimitive | undefined;
    $getCascade: (key: string) => CSSPrimitive | undefined;
    $getMany: (keys: string[], options?: CascadeOptions) => Record<string, CSSPrimitive | undefined>;
    $bp: Breakpoint;
};

// Reusable grid token/matrix
export type Token = string;
export type Matrix = Token[][];

// Parent meta from useParentGridMeta
export type ParentMeta = {
    parentId: string | null;
    parentBlock: any | null;
    parent: (BlockAttributes & {
        $get: (key: string, options?: CascadeOptions) => CSSPrimitive | undefined;
        $bp?: Breakpoint;
    }) | null;

    isGrid: boolean;
    display: string;

    columnTemplate: string;
    rowTemplate: string;
    areaTemplate: string;

    columns: number;
    rows: number;
};

// Result shape for useParentAttrs
export type ParentAttrsResult = {
    parentId: string | null;
    parentBlock: any | null;
    parentAugmented: AugmentedAttributes | null;
    parentAttrs: Record<string, CSSPrimitive | undefined> | null;
};
