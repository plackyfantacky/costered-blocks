// types/wp/element.d.ts
declare module '@wordpress/element' {
    export * from 'react';
    const _default: any;
    export default _default;
    export const createElement: typeof import('react').createElement;
    export const Fragment: typeof import('react').Fragment;
    export const useState: typeof import('react').useState;
    export const useEffect: typeof import('react').useEffect;
    export const useContext: typeof import('react').useContext;
    export const useRef: typeof import('react').useRef;
    export const useMemo: typeof import('react').useMemo;
    export const useCallback: typeof import('react').useCallback;
    export const useReducer: typeof import('react').useReducer;
    export const useLayoutEffect: typeof import('react').useLayoutEffect;
    export const Children: typeof import('react').Children;
    export const cloneElement: typeof import('react').cloneElement;
    export const isValidElement: typeof import('react').isValidElement;
    export const Component: typeof import('react').Component;
}
