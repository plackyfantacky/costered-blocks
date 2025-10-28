// types/wp/blob.d.ts
declare module '@wordpress/blob' {
    export function createBlobURL(file: File | Blob): string;
    export function getBlobByURL(url: string): Blob | undefined;
    export function isBlobURL(url?: string): boolean;
    export function revokeBlobURL(url: string): void;
}
