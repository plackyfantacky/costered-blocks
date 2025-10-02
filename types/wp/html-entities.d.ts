// types/wp/html-entities.d.ts
declare module '@wordpress/html-entities' {
    export function decodeEntities(input: string): string;
    export function encodeEntities(input: string): string;
}
