import { select as sel } from '@wordpress/data';
import { REDUX_STORE_KEY } from '@config';

const mapDeviceToBp = (device) => {
    const dev = String(device ?? '').toLowerCase();
    if (dev === 'mobile' || dev === 'phone' || dev === 'tablet') return 'mobile';
    return 'desktop';
};

const readEditorDeviceType = (selector) => {
    try {
        const editPost = selector('core/edit-post');
        if (editPost) {
            if (typeof editPost.getPreviewDeviceType === 'function') return editPost.getPreviewDeviceType();
            if (typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
        }
    } catch (e) { /* ignore */ }

    try {
        const editSite = selector('core/edit-site');
        if (editSite) {
            if (typeof editSite.getDeviceType === 'function') return editSite.getDeviceType();
            if (typeof editSite.__experimentalGetPreviewDeviceType === 'function') return editSite.__experimentalGetPreviewDeviceType();
            if (typeof editSite.getPreviewDeviceType === 'function') return editSite.getPreviewDeviceType();
        }
    } catch (e) { /* ignore */ }

    return undefined;
};

export const selectActiveBreakpoint = (selector) => {
    //1. prefer store if available
    try {
        const selected = sel(REDUX_STORE_KEY);
        if (selected && typeof selected.getBreakpoint === 'function') {
            const value = selected.getBreakpoint();
            if (value) return value;
        }
    } catch { /* store not registered yet */ }

    //2. editor device if available
    const device = readEditorDeviceType(selector);
    if (device) return mapDeviceToBp(device);

    //3. window size
    if (typeof window !== 'undefined' && typeof window.__COSTERED_VIEWPORT_BP === 'string') {
        return window.__COSTERED_VIEWPORT_BP || 'desktop';
    }

    // TEMP DEBUG (safe syntax, no weird optional chaining)
    try {
        if (window.COSTERED_DEBUG) {
            const storeSel = sel(STORE_KEY);
            const storeBp = (storeSel && typeof storeSel.getBreakpoint === 'function')
                ? storeSel.getBreakpoint()
                : null;

            const ep = sel('core/edit-post');
            const epDevice =
                ep && (
                    (typeof ep.getPreviewDeviceType === 'function' && ep.getPreviewDeviceType()) ||
                    (typeof ep.__experimentalGetPreviewDeviceType === 'function' && ep.__experimentalGetPreviewDeviceType())
                );

            const es = sel('core/edit-site');
            const esDevice =
                es && (
                    (typeof es.getDeviceType === 'function' && es.getDeviceType()) ||
                    (typeof es.__experimentalGetPreviewDeviceType === 'function' && es.__experimentalGetPreviewDeviceType()) ||
                    (typeof es.getPreviewDeviceType === 'function' && es.getPreviewDeviceType())
                );
        }
    } catch (e) { /* ignore */ }

    //fallback to default
    return 'desktop';
};