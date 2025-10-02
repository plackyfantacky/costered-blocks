// types/wp/preferences.d.ts
declare module '@wordpress/preferences' {
    export const store: any;
    export function get(namespace: string, key: string, fallback?: any): any;
    export function set(namespace: string, key: string, value: any): void;
    declare function _delete(namespace: string, key: string): void;
    export { _delete as delete };
}
