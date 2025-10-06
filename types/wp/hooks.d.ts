// types/wp/hooks.d.ts
declare module '@wordpress/hooks' {
    export type Callback = (...args: any[]) => any;

    export function addAction(hookName: string, namespace: string, callback: Callback, priority?: number): void;
    export function addFilter(hookName: string, namespace: string, callback: Callback, priority?: number): void;
    export function removeAction(hookName: string, namespace: string): void;
    export function removeFilter(hookName: string, namespace: string): void;
    export function doAction(hookName: string, ...args: any[]): void;
    export function applyFilters<T = any>(hookName: string, value: T, ...args: any[]): T;
    export function hasAction(hookName: string, namespace?: string): boolean;
    export function hasFilter(hookName: string, namespace?: string): boolean;

    export function createHooks(): {
        addAction: typeof addAction;
        addFilter: typeof addFilter;
        removeAction: typeof removeAction;
        removeFilter: typeof removeFilter;
        doAction: typeof doAction;
        applyFilters: typeof applyFilters;
        hasAction: typeof hasAction;
        hasFilter: typeof hasFilter;
    };
}
