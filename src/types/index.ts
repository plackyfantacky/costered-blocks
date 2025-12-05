// Basic primitives

export type CSSPrimitive = string | number;
export type MeasurementMode = 'unit' | 'text';
export type StyleMap = Record<string, string>; // cannonical shape for styles

export type { Breakpoint, BreakpointBucket } from './breakpoints.ts';
export type { CosteredAttributes, BlockAttributes, CascadeOptions, AugmentedAttributes, UnsavedAttr } from './attributes.ts';

// UI context

export type GetterLike = {
    $get?: (key: string, options?: unknown) => unknown;
} & Record<string, unknown>;

export type VisibilityCtx = {
    attributes?: GetterLike | null | undefined;
    parentAttrs?: GetterLike | null | undefined;
};

// Grid data types

export type {
    GridControlsPanelMap,
    GridControlsPanelProps,
    GridAxisModeKey,
    GridAxisKey,
    GridAxisModel,
    GridAxisDisabled,
    GridModel,
    GridItemPanelKey,
    ColumnInfo,
    RowInfo,
    Token,
    Matrix
} from './grid.ts';

// useParentGridMeta
// useParentAttrs

export type { ParentMeta, ParentAttrsResult } from './parent.ts';

// components

export type {
    Children,
    ClassStyle,
    OnChange,
    OnToggle,
    Option
} from './components.ts';

// tokens

export type { TokenAtomicItem, TokenModelAdapter, PersistedTracks, PersistedAreas } from './tokens.ts';

// Block UI
export type { BlockUIRenderContext, BlockUIComponent } from './block-ui.ts';

// Inline SVG

export type { InlineSVGAttrs, InlineSVGSetter, SVGMediaMinimal } from './inlineSVG.ts';