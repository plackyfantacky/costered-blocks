// types/wp/data.d.ts
declare module '@wordpress/data' {
    export function createReduxStore<K extends string, S>(name: K, options: S): void;
    export function dispatch<K extends string>(store: K): any;
    export function getStore<K extends string>(name: K): any;
    export function register<K extends string, S>(name: K, options: S): void;
    export function registerStore<K extends string, S>(name: K, options: S): void;
    export function select<K extends string>(store: K): any;
    export function subscribe(listener: () => void): () => void;
    export function useDispatch<K extends string>(store: K): any;
    export function useSelect<T>(selector: (select: (store: string) => any) => T, dependencies?: any[]): T;
}