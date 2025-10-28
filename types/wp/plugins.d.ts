// types/wp/plugins.d.ts
declare module '@wordpress/plugins' {
    export function registerPlugin(name: string, settings: any): void;
    export function unregisterPlugin(name: string): void;
    export function getPlugin(name: string): any;
    export function getPlugins(): any[];
}
