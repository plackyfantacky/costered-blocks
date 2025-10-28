// types/wp/viewport.d.ts
declare module '@wordpress/viewport' {
    export function useViewportMatch(minWidth?: number, maxWidth?: number): boolean;
    export const store: any;
}
