import { useCallback, useMemo, useState } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { normaliseSVGForHTML } from '@utils/markupUtils';
import { LABELS } from "@labels";

type MediaMinimal = {
    id?: number | string;
    url?: string;
    source_url?: string;
    mime?: string;
    mime_type?: string;
};

type Attrs = {
    mediaId: number;
    mediaUrl: string;
    svgClasses: string;
    linkURL: string;
    linkClasses: string;
    svgMarkup: string;
    svgWidth: string;
    svgHeight: string;
}

type Setter = (patch: Partial<Attrs>) => void;

const labels = LABELS.blocks.inlineSVG;

export function applySVGDimensions(svgMarkup: string, width?: string, height?: string): string {
    try {
        if (!svgMarkup || !svgMarkup.trim()) return svgMarkup;
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgMarkup, 'image/svg+xml');
        const svg = doc.documentElement;
        if (!svg || svg.nodeName.toLowerCase() !== 'svg') return svgMarkup;

        const w = (width ?? '').trim();
        const h = (height ?? '').trim();
        if (w) svg.setAttribute('width', w); else svg.removeAttribute('width');
        if (h) svg.setAttribute('height', h); else svg.removeAttribute('height');

        return new XMLSerializer().serializeToString(svg);
    } catch {
        return svgMarkup;
    }
}

export async function fetchSanitisedSVG(attachmentId: number): Promise<string> {
    const apiFetch = (window as any)?.wp?.apiFetch;
    const res = await apiFetch?.({
        path: `/costered-blocks/v1/svg/${attachmentId}`,
        method: 'GET',
        parse: true
    });
    const svg = typeof res?.svg === 'string' ? res.svg : null;
    if (!svg) throw new Error(labels.notice.errorFetchResponseInvalid);
    return svg;
}

export function useInlineSVG(
    attributes: Attrs,
    setAttributes: Setter
) {
    const {
        mediaId = 0,
        mediaUrl = '',
        svgMarkup = '',
        svgWidth = '',
        svgHeight = '',
        linkURL = '',
        linkClasses = '',
        svgClasses = '',
    } = attributes;

    const [isLoading, setLoading] = useState(false);
    const hasSVG = useMemo(() => Number(mediaId) > 0 && !!mediaUrl, [mediaId, mediaUrl]);
    const write = useCallback((patch: Partial<Attrs>) => setAttributes(patch), [setAttributes]);

    const loadMarkup = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const raw = await fetchSanitisedSVG(id);
            const htmlLike = normaliseSVGForHTML(raw);
            const withDims = applySVGDimensions(htmlLike, svgWidth, svgHeight);
            write({ svgMarkup: withDims });
        } catch (error: any) {
            const msg = error?.message || error?.data?.message || labels.notice.errorFetchResponseUnknownFallback;
            const notice = sprintf(labels.notice.errorFetchResponseUnknown, msg);
            (window as any)?.wp?.data?.dispatch('core/notices')?.createNotice?.('error', notice, { type: 'snackbar' });
            write({ svgMarkup: '' });
        } finally {
            setLoading(false);
        }
    }, [write, svgWidth, svgHeight]);

    const onSelectMedia = useCallback((media: MediaMinimal) => {
        const mime = media?.mime ?? media?.mime_type ?? '';
        if (mime !== 'image/svg+xml') {
            const notice = labels.notice.errorUIInvalidFileType;
            (window as any)?.wp?.data?.dispatch('core/notices')?.createNotice?.('warning', notice, { type: 'snackbar' });
            return;
        }
        const id = Number(media?.id) || 0;
        const url = String(media?.url || media?.source_url || '');
        write({ mediaId: id, mediaUrl: url });
        if (id > 0) { void loadMarkup(id); }
    }, [write, loadMarkup]);

    const onClearMedia = useCallback(() => {
        write({ mediaId: 0, mediaUrl: '', svgMarkup: '' });
    }, [write]);

    const onChangeWidth = useCallback((value?: string) => {
        const next = value ?? '';
        const nextMarkup = applySVGDimensions(typeof svgMarkup === 'string' ? svgMarkup : '', next, svgHeight);
        write({ svgWidth: next, svgMarkup: nextMarkup });
    }, [write, svgMarkup, svgHeight]);

    const onChangeHeight = useCallback((value?: string) => {
        const next = value ?? '';
        const nextMarkup = applySVGDimensions(typeof svgMarkup === 'string' ? svgMarkup : '', svgWidth, next);
        write({ svgHeight: next, svgMarkup: nextMarkup });
    }, [write, svgMarkup, svgWidth]);

    return {
        isLoading,
        hasSVG,
        //values
        mediaId: Number(mediaId) || 0,
        mediaUrl: String(mediaUrl) || '',
        svgMarkup: String(svgMarkup) || '',
        svgWidth: String(svgWidth) || '',
        svgHeight: String(svgHeight) || '',
        linkURL: String(linkURL) || '',
        linkClasses: String(linkClasses) || '',
        svgClasses: String(svgClasses) || '',
        //actions
        onSelectMedia,
        onClearMedia,
        onChangeWidth,
        onChangeHeight,
        loadMarkup,
        write
    }
}