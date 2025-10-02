// types/wp/keycodes.d.ts
declare module '@wordpress/keycodes' {
    export const BACKSPACE: number;
    export const TAB: number;
    export const ENTER: number;
    export const ESCAPE: number;
    export const SPACE: number;
    export const LEFT: number;
    export const UP: number;
    export const RIGHT: number;
    export const DOWN: number;

    export function isKeyboardEvent(primary: string | number, event: KeyboardEvent): boolean;
}
