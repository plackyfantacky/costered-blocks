import type { CSSProperties, ReactNode } from "react";

// Basic primitives
export type Breakpoint = 'desktop' | 'tablet' | 'mobile';
export type CSSPrimitive = string | number;
export type MeasurementMode = 'unit' | 'text';

// cannonical shape for styles
export type StyleMap = Record<string, string>;

export interface BreakpointBucket {
    styles: StyleMap; // raw wire format
}

export type CosteredAttributes = Partial<Record<Breakpoint, BreakpointBucket>>;

export interface BlockAttributes {
    costered?: CosteredAttributes;
    costeredId?: string;
    [key: string]: unknown;
}

// UI context

export type GetterLike = {
    $get?: (key: string, options?: unknown) => unknown;
} & Record<string, unknown>;

export type VisibilityCtx = {
    attributes?: GetterLike | null | undefined;
    parentAttrs?: GetterLike | null | undefined;
};

// Reader options shared across hooks
export type CascadeOptions = { cascade?: boolean; raw?: boolean };

// Non-generic augmented attributes surface used throughout the editor
export type AugmentedAttributes = BlockAttributes & {
    $get: (key: string, options?: CascadeOptions) => CSSPrimitive | undefined;
    $getCascade: (key: string) => CSSPrimitive | undefined;
    $getMany: (keys: ReadonlyArray<string>, options?: CascadeOptions) => Record<string, CSSPrimitive | undefined>;
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

/* ------------------------- Component Types ------------------------ */

export type Children = { children?: ReactNode };
export type ClassStyle = { className?: string; style?: CSSProperties };

// event handler types
export type OnChange<Token = unknown> = (value: Token) => void;
export type OnToggle = (next: boolean) => void;

export type Option<Value extends string = string> = { label: string; value: Value };