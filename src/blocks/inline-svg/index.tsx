import { registerBlockType } from '@wordpress/blocks';
import { MediaUpload, MediaUploadCheck, useBlockProps} from '@wordpress/block-editor';
import { PanelBody, PanelRow, Button, Notice, Spinner, Flex, FlexItem } from '@wordpress/components';
import { useCallback, useMemo, RawHTML } from '@wordpress/element';

import CustomMediaTrigger from '@components/CustomMediaTrigger';
import TextControlInput from "@components/TextControlInput";
import UnitControlInput from "@components/UnitControlInput";
import { VscodeIconsFileTypeSvg as SVGIcon } from '@assets/icons';
import { useInlineSVG } from './utils';
import { LABELS } from "@labels";
import CosteredBlockControls from '@utils/slotFillUtils';

import metadata from './block.json';

type ControlsProps = {
    attributes: Record<string, any>;
    setAttributes: (partial: Record<string, any>) => void;
    onSelectMedia?: (media: any) => void;
    onClearMedia?: () => void;
    onChangeWidth?: (value?: string) => void;
    onChangeHeight?: (value?: string) => void;
    isLoading?: boolean;
}

type SaveAttrs = {
    svgMarkup: unknown;
    svgClasses?: string;
    linkURL?: string;
    linkClasses?: string;
};

const labels = LABELS.blocks.inlineSVG;

function InlineSVGControls({
    attributes,
    setAttributes,
    onSelectMedia,
    onClearMedia,
    onChangeWidth,
    onChangeHeight,
    isLoading = false
}: ControlsProps) {
    const mediaId = Number(attributes.mediaId || 0);
    const svgClasses = String(attributes.svgClasses || '');
    const linkURL = String(attributes.linkURL || '');
    const linkClasses = String(attributes.linkClasses || '');
    const svgWidth = String(attributes.svgWidth || '');
    const svgHeight = String(attributes.svgHeight || '');
    const hasSVG = useMemo(
        () => Number(attributes.mediaId || 0) > 0 && !!attributes.mediaUrl,
        [attributes.mediaId, attributes.mediaUrl]
    );

    const handleWidthChange = useCallback((value: string | number) => {
        onChangeWidth?.(typeof value === 'string' ? value : String(value));
    }, [onChangeWidth]);

    const handleHeightChange = useCallback((value: string | number) => {
        onChangeHeight?.(typeof value === 'string' ? value : String(value));
    }, [onChangeHeight]);

    return (
        <>
            <PanelBody title={labels.panelTitle} initialOpen={true}>
                <PanelRow>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={onSelectMedia}
                                allowedTypes={['image/svg+xml']}
                                value={mediaId || undefined}
                                render={({ open }: { open: () => void }) => (
                                    <Button variant="primary" onClick={open}>
                                        { hasSVG ? labels.actions.replaceSVG : labels.actions.selectSVG }
                                    </Button>
                                )}
                            />
                        </MediaUploadCheck>
                        { hasSVG && (
                            <Button variant="secondary" onClick={onClearMedia}>
                                { labels.actions.clear }
                            </Button>
                        )}
                        {isLoading && <Spinner />}
                    </div>
                </PanelRow>
                
                <PanelRow>
                    <TextControlInput
                        label={labels.fields.svgClasses.label}
                        value={svgClasses}
                        onChange={(val?: string) => setAttributes({ svgClasses: val ?? '' })}
                        help={labels.fields.svgClasses.help}
                    />
                </PanelRow>

                <PanelRow>
                    <Flex direction="row" gap={4}>
                        <UnitControlInput
                            label={labels.fields.svgWidth.label}
                            value={svgWidth}
                            onChange={handleWidthChange}
                            placeholder="e.g. 100px, 10rem, 50%"
                            allowReset={true}
                        />
                        <UnitControlInput
                            label={labels.fields.svgHeight.label}
                            value={svgHeight}
                            onChange={handleHeightChange}
                            placeholder="e.g. 100px, 10rem, 50%"
                            allowReset={true}
                        />
                    </Flex>
                </PanelRow>

            </PanelBody>

            <PanelBody title={labels.linkPanelTitle} initialOpen={false}>
                <PanelRow>
                    <TextControlInput
                        label={labels.fields.linkURL.label}
                        value={linkURL}
                        onChange={(val: string) => setAttributes({ linkURL: val ?? '' })}
                        placeholder="https://example.com"
                    />
                </PanelRow>

                <PanelRow>
                    <TextControlInput
                        label={labels.fields.linkClasses.label}
                        value={linkClasses}
                        onChange={(val: string) => setAttributes({ linkClasses: val ?? '' })}
                        help={labels.fields.linkClasses.help}
                    />
                </PanelRow>

                {!hasSVG && linkURL && (
                    <Notice status="warning" isDismissible={false}>
                        {labels.notice.warningLinkButNoSVG}
                    </Notice>
                )}
            </PanelBody>
        </>
    )
    
};

registerBlockType(metadata.name, {
    ...metadata as any,
    icon: SVGIcon,

    edit(props: any) {
        const { isSelected, attributes, setAttributes } = props;
        
        const io = useInlineSVG(attributes, setAttributes);
        const blockProps = useBlockProps({
            className: [
                'costered-blocks--inline-svg',
                attributes.linkURL ? 'is-linked' : '',
            ]
        });

        const Inner = io.svgMarkup ? <RawHTML>{io.svgMarkup}</RawHTML> : null;
    
        return (
            <>
                {isSelected && (
                    <CosteredBlockControls.Fill>
                        {/* existing Inspector controls go here unchanged */}
                        <InlineSVGControls 
                            attributes={attributes} 
                            setAttributes={setAttributes} 
                            onSelectMedia={io.onSelectMedia}
                            onClearMedia={io.onClearMedia}
                            onChangeWidth={io.onChangeWidth}
                            onChangeHeight={io.onChangeHeight}
                            isLoading={io.isLoading}
                        />
                    </CosteredBlockControls.Fill>
                )}
                {/* Editor preview uses the exact markup that will be saved */}
                <div {...blockProps}>
                    {Inner ? (
                        Inner
                    ) : (
                        <CustomMediaTrigger
                            onSelect={io.onSelectMedia}
                            accept={['image/svg+xml']}
                            value={io.mediaId || undefined}
                            label={labels.fields.customMedia.label}
                            className="costered-blocks--custom-media-trigger"
                        />
                    )}
                </div>
            </>
        );
    },

    save({ attributes } : { attributes: SaveAttrs }) {
        const svgMarkup = typeof attributes.svgMarkup === 'string' ? attributes.svgMarkup : '';
        if (!svgMarkup) return null;

        const className = ['costered-blocks--inline-svg', attributes.svgClasses || ''].filter(Boolean).join(' ');

        const blockProps = useBlockProps.save({ className });

        const Inner = (
            <div { ...blockProps }>
                <RawHTML>{ svgMarkup }</RawHTML>
            </div>
        );

        return attributes.linkURL
            ? <a href={attributes.linkURL} className={attributes.linkClasses || undefined}>{Inner}</a>
            : Inner;
    }
});