// types/wp/i18n.d.ts
declare module '@wordpress/i18n' {
    export function __(text: string, domain?: string): string;
    export function _x(text: string, context: string, domain?: string): string;
    export function sprintf(format: string, ...args: unknown[]): string;
}
