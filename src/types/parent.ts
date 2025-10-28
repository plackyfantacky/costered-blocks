import type { CSSPrimitive } from "./index";
import type { Breakpoint } from "./breakpoints";
import type { BlockAttributes, CascadeOptions, AugmentedAttributes } from "./attributes";

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
    areaNames: string[];
};

export type ParentAttrsResult = {
    parentId: string | null;
    parentBlock: any | null;
    parentAugmented: AugmentedAttributes | null;
    parentAttrs: Record<string, CSSPrimitive | undefined> | null;
};