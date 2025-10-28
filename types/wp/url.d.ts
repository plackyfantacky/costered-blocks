// types/wp/url.d.ts
declare module '@wordpress/url' {
    export function addQueryArgs(url: string, args: Record<string, any>): string;
    export function removeQueryArgs(url: string, ...keys: string[]): string;
    export function getQueryArgs(url: string): Record<string, string>;
    export function isURL(url?: string): boolean;
    export function isEmail(email?: string): boolean;
    export function safeDecodeURI(uri: string): string;
    export function safeDecodeURIComponent(uri: string): string;
    export function filterURLForDisplay(url: string, options?: { keepProtocol?: boolean }): string;
    export function prependHTTP(url: string): string;
    export function getAuthority(url: string): string | null;
    export function getPath(url: string): string | null;
    export function getProtocol(url: string): string | null;
}
