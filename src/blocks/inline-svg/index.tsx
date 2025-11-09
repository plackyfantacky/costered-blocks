import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, MediaUpload, MediaUploadCheck, MediaPlaceholder, useBlockProps} from '@wordpress/block-editor';
import { PanelBody, PanelRow, Button, TextControl, Notice, Spinner } from '@wordpress/components';
import { Fragment, useCallback, useMemo, useState, RawHTML } from '@wordpress/element';

import { VscodeIconsFileTypeSvg as SVGIcon } from '@assets/icons';
import { normaliseSVGForHTML } from "@utils/markupUtils";
import { LABELS } from "@labels";

import metadata from './block.json';

type Attrs = {
    mediaId: number;
    mediaUrl: string;
    svgClasses: string;
    linkURL: string;
    linkClasses: string;
    svgMarkup: string;
}

type BlockEditProps<Token> = { attributes: Token; setAttributes: ( next: Partial<Token> ) => void; clientId: string; };
type MediaMinimal = { id?: number | string; url?: string; source_url?: string; mime?: string; mime_type?: string; };
type MediaUploadRenderArgs = { open: () => void };

async function fetchSanitisedSVG(attachmentId: number): Promise<string> {
    try {
        const response = await window.wp.apiFetch({
            path: `/costered-blocks/v1/svg/${attachmentId}`,
            method: 'GET',
            parse: true,
        } as any);

        if (response && typeof response.svg === 'string') {
            return response.svg;
        }
    
        throw new Error('Invalid response structure from SVG fetch.');
    } catch (error: any) {
        console.error('[InlineSVG] Error fetching SVG:', error);
        const message = error?.message || error?.data?.message || 'Unknown error fetching SVG markup.';
        window.wp?.data?.dispatch('core/notices')?.createNotice?.('error', `Inline SVG fetch failed: ${message}`, { type: 'snackbar' });
        throw error;
    }
}

registerBlockType<Attrs>(metadata.name, {
    ...metadata as any,
    icon: SVGIcon,

    edit({ attributes, setAttributes }: BlockEditProps<Attrs>) {
        const { mediaId, mediaUrl, svgClasses, linkURL, linkClasses, svgMarkup } = attributes;
        const labels = LABELS.blocks.inlineSVG;
        const [ isLoading, setLoading ] = useState(false);
        const hasSvg = useMemo(() => mediaId > 0 && mediaUrl !== '', [mediaId, mediaUrl]);

        const blockProps = useBlockProps({ 
            className: [ 'costered-blocks--inline-svg', svgClasses || '' ].filter(Boolean).join(' ')
        });

        const loadMarkup = useCallback(async (id: number) => {
            setLoading(true);
            try {
                const svg = await fetchSanitisedSVG(id);
                const htmlish = normaliseSVGForHTML(svg);

                if (!/<svg[\s>]/i.test(htmlish)) {
                    throw new Error('Response does not look like SVG');
                }
                
                setAttributes({ svgMarkup: htmlish });
            } catch (error) {
                console.error('[InlineSVG] Error loading SVG:', error);
                window?.wp?.data?.dispatch('core/notices')?.createNotice?.('error', labels.notice.svgFetchError, { type: 'snackbar' });
                setAttributes({ svgMarkup: '' });
            } finally {
                setLoading(false);
            }
        }, [setAttributes]);

        const onSelectMedia = useCallback((media: MediaMinimal) => {
            const mime = media?.mime ?? media?.mime_type ?? '';
            if (mime !== 'image/svg+xml') {
                window?.wp?.data?.dispatch('core/notices')?.createNotice?.('warning', labels.notice.svgNotSelected, { type: 'snackbar' });
                return;
            }
            const id = Number(media.id) || 0;
            const url = String(media.url || media.source_url || '');
            setAttributes({ mediaId: id, mediaUrl: url });
            if (id > 0) { void loadMarkup(id); }
        }, [setAttributes]);

        const clearMedia = useCallback(() => {
            setAttributes({ mediaId: 0, mediaUrl: '', svgMarkup: '' });
        }, [setAttributes]);

        const Inner = <RawHTML>{(svgMarkup || '').trim()}</RawHTML>;

        const gutenbergClassnames = useMemo(() => {
            const classes = [ 'wp-block', `wp-block-${metadata.name.replace('/', '-')}` ];
            return classes.join(' ');
        }, []);

        return (
            <Fragment>
                <InspectorControls>
                    <PanelBody title={labels.panelTitle} initialOpen={true}>
                        <PanelRow>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <MediaUploadCheck>
                                    <MediaUpload
                                        onSelect={onSelectMedia}
                                        allowedTypes={['image/svg+xml']}
                                        value={mediaId}
                                        render={({ open }: MediaUploadRenderArgs) => (
                                            <Button variant="primary" onClick={open}>
                                                { hasSvg ? labels.actions.replaceSVG : labels.actions.selectSVG }
                                            </Button>
                                        )}
                                    />
                                </MediaUploadCheck>
                                { hasSvg && (
                                    <Button variant="secondary" onClick={clearMedia}>
                                        { labels.actions.clear }
                                    </Button>
                                )}
                                {isLoading && <Spinner />}
                            </div>
                        </PanelRow>
                        <PanelRow>
                            <TextControl
                                label={labels.fields.svgClasses.label}
                                value={svgClasses}
                                onChange={(val: string) => setAttributes({ svgClasses: val ?? '' })}
                                help={labels.fields.svgClasses.help}
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                            />
                        </PanelRow>
                    </PanelBody>

                    <PanelBody title={labels.linkPanelTitle} initialOpen={false}>
                        <PanelRow>
                            <TextControl
                                label={labels.fields.linkURL.label}
                                value={linkURL}
                                onChange={(val: string) => setAttributes({ linkURL: val ?? '' })}
                                placeholder="https://example.com"
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                            />
                        </PanelRow>
                        <PanelRow>
                            <TextControl
                                label={labels.fields.linkClasses.label}
                                value={linkClasses}
                                onChange={(val: string) => setAttributes({ linkClasses: val ?? '' })}
                                help={labels.fields.linkClasses.help}
                                __nextHasNoMarginBottom
                                __next40pxDefaultSize
                            />
                        </PanelRow>
                        {!hasSvg && linkURL && (
                            <Notice status="warning" isDismissible={false}>
                                {labels.notice.linkButNoSVG}
                            </Notice>
                        )}
                    </PanelBody>
                </InspectorControls>
                {/* Editor preview uses the exact markup that will be saved */}
                <div {...blockProps}>
                    {svgMarkup ? (
                        <>
                            {linkURL
                                ? <a href={linkURL} className={linkClasses || undefined}>{Inner}</a>
                                : Inner}
                        </>
                    ) : (
                        <MediaPlaceholder
                            onSelect={onSelectMedia}
                            allowedTypes={['image/svg+xml']}
                            labels={{
                                title: labels.mediaPlaceholder.title,
                                instructions: labels.mediaPlaceholder.instructions,
                            }}
                            disableMediaButtons={false} 
                        />
                    )}
                </div>
            </Fragment>
        );
    },

    save({ attributes } : { attributes: Attrs }) {
        const { svgMarkup, svgClasses, linkURL, linkClasses } = attributes;
        if (!svgMarkup) return null;

        const blockProps = useBlockProps.save({ 
            className: ['costered-blocks--inline-svg', svgClasses || ''].filter(Boolean).join(' ')
        });

        const Inner = (
            <div { ...blockProps }>
                <RawHTML>{ svgMarkup }</RawHTML>
            </div>
        );

        return linkURL
            ? <a href={linkURL} className={linkClasses || undefined}>{Inner}</a>
            : Inner;
    }
});