// Forward the automatic JSX runtime typing to React’s types.
// We keep runtime external to wp.element; this is types-only.
declare module '@wordpress/element/jsx-runtime' {
    export * from 'react/jsx-runtime';
}
