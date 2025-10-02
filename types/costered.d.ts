// types/costered.d.ts

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

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

export interface BreakpointBucket {
    styles: RawStyle[]; // raw wire format
}

export interface CosteredAttributes {
    desktop?: BreakpointBucket;
    tablet?: BreakpointBucket;
    mobile?: BreakpointBucket;
}

export interface BlockAttributes {
    costered?: CosteredAttributes;
    [key: string]: unknown;
}