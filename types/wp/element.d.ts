// types/wp/element.d.ts
declare module '@wordpress/element' {
    export * from 'react';
    const _default: any;
    export default _default;
    export const Children: typeof import('react').Children;
    export const cloneElement: typeof import('react').cloneElement;
    export const Component: typeof import('react').Component;
    export const createContext: typeof import('react').createContext;
    export const createElement: typeof import('react').createElement;
    export const Fragment: typeof import('react').Fragment;
    export const isValidElement: typeof import('react').isValidElement;
    export const memo: typeof import('react').memo;
    export const useCallback: typeof import('react').useCallback;
    export const useContext: typeof import('react').useContext;
    export const useEffect: typeof import('react').useEffect;
    export const useLayoutEffect: typeof import('react').useLayoutEffect;
    export const useMemo: typeof import('react').useMemo;
    export const useReducer: typeof import('react').useReducer;
    export const useRef: typeof import('react').useRef;
    export const useState: typeof import('react').useState;
}
