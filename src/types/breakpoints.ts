import type { StyleMap } from "./index";

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';
export interface BreakpointBucket {
    styles: StyleMap; // raw wire format
}