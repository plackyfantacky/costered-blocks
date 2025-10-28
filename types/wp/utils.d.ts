// types/wp/utils.d.ts
declare module '@wordpress/utils' {
    export const deprecated: any;
    export const clamp: any;
    export const createInterpolateElement: any;
    export const isShallowEqual: any;
    export const memize: any;
    export const cleanForSlug: any;
    export const speak: any;
    export const uniqueId: (prefix?: string) => string;
    export const pick: (obj: any, keys: string[]) => any;
    export const omit: (obj: any, keys: string[]) => any;
}
