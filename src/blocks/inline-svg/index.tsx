import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps} from '@wordpress/block-editor';
import { PanelBody, PanelRow, Notice } from '@wordpress/components';
import { useState, useMemo, RawHTML } from '@wordpress/element';

import { useInlineSVG, useSelectedBlockInfo, useScopedKey, useUIPreferences } from "@hooks";
import { LABELS } from "@labels";
import { VscodeIconsFileTypeSvg as SVGIcon } from '@assets/icons';

import CosteredBlockControls from '@utils/slotFillUtils';
import PanelToggle from "@components/composite/PanelToggle";

import CustomMediaTrigger from '@components/CustomMediaTrigger';
import TextControlInput from "@components/TextControlInput";

import { SVGFileUploader } from '@panels/SVGFileUploader';
import { SVGCodeEditorPanel } from '@panels/SVGCodeEditor';

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

type SVGPanelModeKey = 'file' | 'code';

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
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    if (!clientId) return null;

    const linkURL = String(attributes.linkURL || '');
    const linkClasses = String(attributes.linkClasses || '');

    const hasSVG = useMemo(
        () => Number(attributes.mediaId || 0) > 0 && !!attributes.mediaUrl,
        [attributes.mediaId, attributes.mediaUrl]
    );

    /* --- panel prefs + mode --- */

    const panelPrefKey = useScopedKey('inlineSVGEditMode', { blockName: metadata.name });
    const [panelStoredKey, setPanelStoredKey] = useUIPreferences<string>(panelPrefKey, 'file');

    /* --- panel mode toggle --- */
    
    const panelsMap = useMemo(() => ({
        file: SVGFileUploader,
        code: SVGCodeEditorPanel,
    }), []);
    const panelKeys = useMemo(() => Object.keys(panelsMap) as Array<SVGPanelModeKey>, [panelsMap]);
    const firstKey = panelKeys[0]!;

    const modeKeySet = useMemo(() => new Set(panelKeys), [panelKeys]);
    const isValid = (k: unknown): k is SVGPanelModeKey =>
        typeof k === "string" && modeKeySet.has(k as SVGPanelModeKey);

    const [panelActiveKey, setPanelActiveKey] = useState<SVGPanelModeKey>(
        isValid(panelStoredKey) ? panelStoredKey : firstKey
    );

    const handleChange = (next: SVGPanelModeKey) => {
        if (!isValid(next) || next === panelActiveKey) return;
        setPanelActiveKey(next);
        setPanelStoredKey(next);
    }

    return (
        <>
            <PanelBody title={labels.panelTitle} initialOpen={true}>
                <PanelToggle
                    className={'costered-blocks--inline-svg--panel-editing-mode'}
                    value={panelActiveKey}
                    onChange={handleChange}
                    label={null}
                    forceActive
                    panels={panelsMap}
                    panelProps={{ 
                        clientId,
                        attributes,
                        setAttributes,
                        onSelectMedia,
                        onClearMedia,
                        onChangeWidth,
                        onChangeHeight,
                        isLoading
                    }}
                >
                    <PanelToggle.Composite value="file">
                        {'File Upload'}
                    </PanelToggle.Composite>
                    <PanelToggle.Composite value="code">
                        {'Code Editor'}
                    </PanelToggle.Composite>
                </PanelToggle>
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