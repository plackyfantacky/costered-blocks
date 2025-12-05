import { useCallback, useMemo } from '@wordpress/element';
import { PanelRow, Button, Spinner, Flex } from '@wordpress/components';
import { MediaUpload, MediaUploadCheck, useBlockProps} from '@wordpress/block-editor';

import { CSSMeasurementSlider } from "@components/CSSMeasurementSlider";

import { LABELS } from '@labels';
import InlineSVGPreview from "@components/InlineSVGPreview";

type Props = {
    clientId: string | null;
    attributes?:  Record<string, any>;
    setAttributes?: (partial: Record<string, any>) => void;
    onSelectMedia?: (media: any) => void;
    onClearMedia?: () => void;
    onChangeWidth?: (value?: string) => void;
    onChangeHeight?: (value?: string) => void;
    isLoading?: boolean;
};


export function SVGFileUploader({
    clientId,
    attributes,
    setAttributes,
    onSelectMedia,
    onClearMedia,
    onChangeWidth,
    onChangeHeight,
    isLoading
}: Props) {
    if (!clientId) return null;

    const mediaId = Number(attributes?.mediaId ?? 0);
    const svgWidth = String(attributes?.svgWidth ?? '');
    const svgHeight = String(attributes?.svgHeight ?? '');

    const labels = LABELS.blocks.inlineSVG;

    const hasSVG = useMemo(
        () => Number(attributes?.mediaId ?? 0) > 0 && !!attributes?.mediaUrl,
        [attributes?.mediaId, attributes?.mediaUrl]
    );

    const handleWidthChange = useCallback((value: string | number) => {
        onChangeWidth?.(typeof value === 'string' ? value : String(value));
    }, [onChangeWidth]);

    const handleHeightChange = useCallback((value: string | number) => {
        onChangeHeight?.(typeof value === 'string' ? value : String(value));
    }, [onChangeHeight]);

    return (
        <>
            <PanelRow>
                <Flex direction="column" gap={4} className="costered-blocks--inline-svg--file-uploader">
                    <InlineSVGPreview
                        svgMarkup={attributes?.svgMarkup}
                        previewUrl={attributes?.mediaUrl}
                        className="costered-blocks--inline-svg--file-uploader--preview"
                    />
                    <Flex direction="row" gap={4} align="center">
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
                    </Flex>
                </Flex>
            </PanelRow>
            
            <PanelRow>
                <Flex direction="column" gap={4} className="costered-blocks--inline-svg--size-controls">
                    <CSSMeasurementSlider
                        label={labels.fields.svgWidth.label}
                        value={svgWidth}
                        onChange={handleWidthChange}
                    />
                    <CSSMeasurementSlider
                        label={labels.fields.svgHeight.label}
                        value={svgHeight}
                        onChange={handleHeightChange}
                    />
                </Flex>
            </PanelRow>
        </>
    )

}