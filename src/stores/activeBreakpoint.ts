import { select as globalSelect } from '@wordpress/data';
import { REDUX_STORE_KEY } from '@config';
import type { Breakpoint } from "@types";

const BP_DESKTOP: Breakpoint = 'desktop';
const BP_TABLET: Breakpoint = 'tablet';
const BP_MOBILE: Breakpoint = 'mobile';

const mapDeviceToBp = (device: unknown): Breakpoint => {
    const dev = String(device ?? '').toLowerCase();
    if (dev === 'tablet' || dev === 'medium') return BP_TABLET;
    if (dev === 'mobile' || dev === 'phone') return BP_MOBILE;
    return BP_DESKTOP;
};

const readEditorDeviceType = (selector: any): string | unknown => {
    try {
        const coreEditor = selector?.('core/editor');
        const modern = coreEditor?.getDeviceType?.();
        if (modern) return modern;
    } catch (e) { /* ignore */ }

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

/**
 * Selector callback for useSelect(() => ...).
 * Order:
 *  1) redux store (if registered)
 *  2) editor preview device (edit-post / edit-site)
 *  3) window hint (__COSTERED_VIEWPORT_BP)
 *  4) 'desktop'
 */
export const selectActiveBreakpoint = (selector: any): Breakpoint => {
    //1. prefer store if available
    try {
        const storeSelector = typeof selector === 'function'
            ? selector(REDUX_STORE_KEY)
            : globalSelect(REDUX_STORE_KEY);
        const value = storeSelector?.getBreakpoint?.();
        if (value === BP_DESKTOP || value === BP_TABLET || value === BP_MOBILE) return value as Breakpoint;
        
    } catch { /* store not registered yet */ }

    //2. editor device if available
    const device = typeof selector === 'function' ? readEditorDeviceType(selector) : readEditorDeviceType(globalSelect);
    if (device) return mapDeviceToBp(device);

    //3. window size
    if (typeof window !== 'undefined') {
        const hinted = (window as any).__COSTERED_VIEWPORT_BP as Breakpoint | undefined;
        if (hinted === BP_DESKTOP || hinted === BP_TABLET || hinted === BP_MOBILE) return hinted;
    }

    //fallback to default
    return 'desktop';
};