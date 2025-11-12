// types/wp/element.d.ts
declare module '@wordpress/element' {
    import type * as React from 'react';

    export * from 'react';

    const _default: typeof React;
    export default _default;

    export const Children: typeof React.Children;
    export const cloneElement: typeof React.cloneElement;
    export const Component: typeof React.Component;
    export const createContext: typeof React.createContext;
    export const createElement: typeof React.createElement;
    export const Fragment: typeof React.Fragment;
    export const isValidElement: typeof React.isValidElement;
    export const memo: typeof React.memo;

    export const RawHTML: React.FC<{ children?: string | null }>;

    export const Suspense: typeof React.Suspense;
    export const useCallback: typeof React.useCallback;
    export const useContext: typeof React.useContext;
    export const useEffect: typeof React.useEffect;
    export const useLayoutEffect: typeof React.useLayoutEffect;
    export const useMemo: typeof React.useMemo;
    export const useReducer: typeof React.useReducer;
    export const useRef: typeof React.useRef;
    export const useState: typeof React.useState;

    export type ReactNode = React.ReactNode;
    export type ElementType = React.ElementType;
    export type ReactElement<P = any, T extends React.ElementType = React.ElementType> = React.ReactElement<P, T>;
    export type CSSProperties = React.CSSProperties;
    export type ComponentProps<T extends React.ElementType> = React.ComponentProps<T>;
    export type ComponentPropsWithoutRef<T extends React.ElementType> = React.ComponentPropsWithoutRef<T>;
    export type ComponentType<P = unknown> = React.ComponentType<P>;
    export type KeyboardEvent<T = Element> = React.KeyboardEvent<T>;
    export type MouseEvent<T = Element> = React.MouseEvent<T>;
}
