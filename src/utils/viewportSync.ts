// src/utils/viewportSync.ts

import { subscribe, select, dispatch } from '@wordpress/data';
import { REDUX_STORE_KEY } from "@config";
import { mapDeviceToBp } from "@utils/breakpointUtils";
import type { Breakpoint } from '@types';

declare global {
    interface Window {
        CB_WP_DEBUG?: boolean;
    }
}

const readEditorDevice = (): string | undefined => {
    // core/editor
    try {
        const coreEditor: any = select('core/editor');
        if (coreEditor && typeof coreEditor.getDeviceType === 'function') {
            return coreEditor.getDeviceType();
        }
    } catch {}

    // Post Editor (edit-post)
    try {
        const editPost: any = select('core/edit-post');
        if (editPost) {
            if (typeof editPost.getDeviceType === 'function')  return editPost.getDeviceType();
            if (typeof editPost.getPreviewDeviceType === 'function') return editPost.getPreviewDeviceType();
            if (typeof editPost.__experimentalGetPreviewDeviceType === 'function') 
                return editPost.__experimentalGetPreviewDeviceType();
        }
    } catch {}

    // Site Editor (edit-site)
    try {
        const editSite: any = select('core/edit-site');
        if (editSite) {
            if (typeof editSite.getDeviceType === 'function') return editSite.getDeviceType();
            if (typeof editSite.getPreviewDeviceType === 'function') return editSite.getPreviewDeviceType();
            if (typeof editSite.__experimentalGetPreviewDeviceType === 'function') 
                return editSite.__experimentalGetPreviewDeviceType();
        }
    } catch {}

    return undefined;
} 

export function startViewportSync(): () => void {
    let lastBp: Breakpoint | null = null;

    const update = () => {
        const dev = readEditorDevice();
        const bp: Breakpoint = mapDeviceToBp(dev || 'desktop');
        if (bp !== lastBp) {
            lastBp = bp;
            try {
                dispatch(REDUX_STORE_KEY as any)?.setBreakpoint?.(bp);
            } catch {}
            if (window.CB_WP_DEBUG) console.log('[costered:bp-sync]', { dev, bp });
        }
    };

    // seed + subscribe
    update();
    const unsubscribe = subscribe(update);
    return unsubscribe;
}

export default startViewportSync;