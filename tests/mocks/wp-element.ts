import React, {
    Children,
    cloneElement,
    Component,
    createContext,
    createElement,
    Fragment,
    isValidElement,
    memo,
    Suspense,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useReducer,
    useRef,
    useState
} from 'react';

// RawHTML is not used in our hook tests. Implement a minimal stub.
export const RawHTML: React.FC<{ children?: string | null }> = ({ children }) => {
    return createElement('div', {
        // In real WP this would dangerouslySetInnerHTML; we do not need that in tests.
        children
    });
};

export {
    Children,
    cloneElement,
    Component,
    createContext,
    createElement,
    Fragment,
    isValidElement,
    memo,
    Suspense,
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useReducer,
    useRef,
    useState
};

export default React;