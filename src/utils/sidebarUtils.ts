import { useMemo, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

import { dbg } from '@utils/debug';
import { SIDEBAR_ID } from "@config";

const RUNTIME = `plugin-${SIDEBAR_ID}`;

export function isPostEditor(): boolean {
    try { return !!(window as any)?.wp?.data?.select('core/edit-post')?.getEditorSettings; }
    catch { return false; }
}

export function isSiteEditor(): boolean {
    try { return !!(window as any)?.wp?.data?.select('core/edit-site'); }
    catch { return false; }
}

function getData() {
    return (window as any)?.wp?.data;
}

function getInterfaceFunctions() {
    const data = getData();
    const selector = data?.select?.('core/interface');
    const dispatcher = data?.dispatch?.('core/interface');
    return {
        getActive: selector?.getActiveComplementaryArea?.bind(selector),
        enable: dispatcher?.enableComplementaryArea?.bind(dispatcher),
    };
}


function getEditorFunctions() {
    const data = getData();
    const editPostSelector = data?.select?.('core/edit-post');
    const editPostDispatch = data?.dispatch?.('core/edit-post');
    const editSiteSelector = data?.select?.('core/edit-site');
    const editSiteDispatch = data?.dispatch?.('core/edit-site');

    return {
        post: {
            getActive:
                editPostSelector?.getActiveGeneralSidebarName?.bind(editPostSelector) ??
                editPostSelector?.getActiveComplementaryAreaName?.bind(editPostSelector),
            openGeneral: editPostDispatch?.openGeneralSidebar?.bind(editPostDispatch),
            openComplementary: editPostDispatch?.openComplementaryArea?.bind(editPostDispatch),
        },
        site: {
            getActive:
                editSiteSelector?.getActiveGeneralSidebarName?.bind(editSiteSelector) ??
                editSiteSelector?.getActiveComplementaryAreaName?.bind(editSiteSelector),
            openGeneral: editSiteDispatch?.openGeneralSidebar?.bind(editSiteDispatch),
            openComplementary: editSiteDispatch?.openComplementaryArea?.bind(editSiteDispatch),
        }
    }
}

export function forceOpenSidebar(): void {
    const data = getData();
    if (!data) return;

    if (isPostEditor()) {
        const dispatch = data?.dispatch?.('core/edit-post');
        try {
            dispatch?.openGeneralSidebar?.(RUNTIME);
            dbg('[open] edit-post openGeneral(runtime)');
            return;
        } catch { /* ignore */ }
        
        try {
            dispatch?.openGeneralSidebar?.(SIDEBAR_ID);
            dbg('[open] edit-post openGeneral(id)');
            return;
        } catch { /* ignore */ }
        return;
    }

    // Site editor / unified interface path
    const iface = data.dispatch('core/interface');
    try {
        iface.enableComplementaryArea?.('core', 'sidebar', RUNTIME);
        dbg('[open] interface enable(core,sidebar,runtime)');
        return;
    } catch {}
}

export function forceOpenSidebarSoon(): void {
    //try immediately
    forceOpenSidebar();
    const { getActive } = getInterfaceFunctions();
    if (typeof getActive !== 'function') return;
    requestAnimationFrame(() => {
        try {
            const active = getActive('core', 'sidebar');
            if (active !== RUNTIME) {
                forceOpenSidebar();
            }
        }
        catch { /* ignore */ }
    });
}

export function SidebarWatcher() {
    const { clientId } = useSelect((select) => {
        const editor = select(blockEditorStore);
        const id = editor.getSelectedBlockClientId?.() ?? null;
        return { clientId: id };
    }, []);

    const lastRef = (window as any)._costered_watcher_lastSelect ?? { current: null };
    (window as any)._costered_watcher_lastSelect = lastRef;

    useEffect(() => {
        const changed = lastRef.current !== clientId;
        dbg('watcher', { prev: lastRef.current, next: clientId, changed });
        lastRef.current = clientId;
        if (!changed || !clientId) return;
        forceOpenSidebarSoon();
    }, [clientId]);

    return null;
}

export function attachNextClickOpener(openFunction: () => void) {
    const handler = () => {
        try {
            const { select } = (window as any).wp?.data || {};
            const editor = select?.('core/block-editor');
            const id = editor?.getSelectedBlockClientId?.() ?? null;
            if (id) {
                openFunction();
                document.removeEventListener('mousedown', handler, true);
                document.removeEventListener('pointerdown', handler, true);
                return;
            }
        } catch {
            // ignore
        }
    };
    document.addEventListener('mousedown', handler, true);
    document.addEventListener('pointerdown', handler, true);
}

export function InterfaceBridge() {
    useEffect(() => {
        const data = (window as any)?.wp?.data;
        if (!data?.subscribe) return;

        const { getActive } = getInterfaceFunctions();

        let prev: string | null | undefined;
        try { prev = getActive('core', 'sidebar'); } catch { /* ignore */ }

        const unsubscribe = data.subscribe(() => {
            let next: string | null | undefined = null;
            try { next = getActive('core', 'sidebar'); } catch { /* ignore */ }

            if (prev === RUNTIME && next !== RUNTIME) {
                attachNextClickOpener(() => forceOpenSidebar());
            }
            prev = next;
        });

        return () => {
            try { unsubscribe?.(); } catch { /* ignore */ }
        };
    }, []);

    return null;
}