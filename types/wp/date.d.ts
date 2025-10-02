// types/wp/date.d.ts
declare module '@wordpress/date' {
    export function dateI18n(format: string, date?: string | number | Date, tz?: string): string;
    export function format(format: string, date?: string | number | Date, tz?: string): string;
    export function __experimentalGetSettings(): any;
    export function getSettings(): any;
    export function isInTheFuture(date: string | number | Date): boolean;
}
