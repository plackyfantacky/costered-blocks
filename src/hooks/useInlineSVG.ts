import { useState, useCallback, useMemo } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { applySVGDimensions, fetchSanitisedSVG, normaliseSVGForHTML } from '@utils/inlineSVGutils';

import { LABELS } from "@labels";
import type { InlineSVGAttrs, InlineSVGSetter, SVGMediaMinimal } from '@types';

const labels = LABELS.blocks.inlineSVG;

export function useInlineSVG(
    attributes: InlineSVGAttrs,
    setAttributes: InlineSVGSetter
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
    const write = useCallback((patch: Partial<InlineSVGAttrs>) => setAttributes(patch), [setAttributes]);

    const loadMarkup = useCallback(async (id: number) => {
        setLoading(true);
        try {
            const raw = await fetchSanitisedSVG(id);
            // if raw is valid SVG, normalise and apply dimensions
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

    const onSelectMedia = useCallback((media: SVGMediaMinimal) => {
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