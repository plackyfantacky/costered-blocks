// types/wp/compose.d.ts
declare module '@wordpress/compose' {
    export function useInstanceId(componentName?: any, prefix?: string, id?: string | number): string;
}
