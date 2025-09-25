import { subscribe, select, dispatch } from '@wordpress/data';
import { REDUX_STORE_KEY } from "@config";

import { mapDeviceToBp } from "@utils/breakpointUtils";

const readEditorDevice = () => {
    // core/editor
    try {
        const coreEditor = select('core/editor');
        if (coreEditor && typeof coreEditor.getDeviceType === 'function') {
            return coreEditor.getDeviceType();
        }
    } catch {}

    // Post Editor (edit-post)
    try {
        const editPost = select('core/edit-post');
        if (editPost) {
            if (editPost && typeof editPost.getDeviceType === 'function')  return editPost.getDeviceType();
            if (typeof editPost.getPreviewDeviceType === 'function') return editPost.getPreviewDeviceType();
            if (typeof editPost.__experimentalGetPreviewDeviceType === 'function') return editPost.__experimentalGetPreviewDeviceType();
        }
    } catch {}

    // Site Editor (edit-site)
    try {
        const editSite = select('core/edit-site');
        if (editSite) {
            if (typeof editSite.getDeviceType === 'function') return editSite.getDeviceType();
            if (typeof editSite.getPreviewDeviceType === 'function') return editSite.getPreviewDeviceType();
            if (typeof editSite.__experimentalGetPreviewDeviceType === 'function') return editSite.__experimentalGetPreviewDeviceType();
        }
    } catch {}

    return undefined;
} 

export function startViewportSync() {
    let lastBp = null;

    const update = () => {
        const dev = readEditorDevice();
        const bp = mapDeviceToBp(dev || 'desktop');
        if (bp !== lastBp) {
            lastBp = bp;
            try {
                dispatch(REDUX_STORE_KEY)?.setBreakpoint?.(bp);
            } catch {}
            if (window.COSTERED_DEBUG) console.log('[costered:bp-sync]', { dev, bp });
        }
    };

    // seed + subscribe
    update();
    const unsubscribe = subscribe(update);
    return unsubscribe;
}