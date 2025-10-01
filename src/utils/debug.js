export function log(...args) {
    if (!window.COSTERED_DEBUG) return;
    // namespaced so it’s searchable in console
    // eslint-disable-next-line no-console
    console.log('[TokenGrid]', ...args);
}