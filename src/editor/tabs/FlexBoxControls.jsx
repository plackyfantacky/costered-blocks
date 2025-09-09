import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexItem } from '@wordpress/components';
import { useSelectedBlockInfo, useAttrSetter } from "@hooks";
import { useCallback, useEffect, useRef } from '@wordpress/element';

import {
    MaterialSymbolsFlexNoWrapRounded as FlexNoWrapRounded, 
    FlexWrapNone,
    FlexWrapWrap, 
    FlexWrapReverse
} from "@assets/icons";
import { LABELS } from "@labels";
import CustomToggleGroup from "@components/CustomToggleGroup";
import FlexDirectionControl from '@components/RtlAware/FlexDirectionControl';
import JustifyControl from '@components/RtlAware/JustifyContentControl';
import AlignControl from '@components/RtlAware/AlignItemsControl';
import { GapControls } from '@components/composite/GapControls';


const isFlexValue = (v) => /^(flex|inline-flex)$/i.test(v);

const FlexBoxControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');
    if (!selectedBlock) return null;

    const { attributes, name } = selectedBlock;
    const { set, setMany } = useAttrSetter(updateBlockAttributes, clientId);

    // Normaliser: respond to 'display' and 'flexDirection' attribute changes
    const prevDisplayRef = useRef(attributes?.display ?? '');
    useEffect(() => {
        const display = attributes?.display ?? '';
        const was = prevDisplayRef.current;
        if (display === was) return;

        // leaving flex: unset flex attributes
        if (isFlexValue(was) && !isFlexValue(display)) {
            setMany({
                flexDirection: undefined,
                flexWrap: undefined,
                justifyContent: undefined,
                alignItems: undefined,
            });
        }

        prevDisplayRef.current = display;
    }, [attributes.display, attributes.flexDirection, set, setMany]);

    const setFlexDirection = useCallback((v) => set('flexDirection', v), [set]);
    const setFlexWrap = useCallback((v) => set('flexWrap', v), [set]);
    const setJustifyContent = useCallback((v) => set('justifyContent', v), [set]);
    const setAlignItems = useCallback((v) => set('alignItems', v), [set]);
    return (
        <Panel>
            <PanelBody title={LABELS.flexBoxControls.panelTitle} initialOpen={true}>
                <Flex direction="column" className="flexbox-controls">
                    <FlexItem>
                        { /* RTL aware */}
                        <FlexDirectionControl
                            attributes={attributes}
                            setFlexDirection={setFlexDirection}
                        />
                    </FlexItem>
                    <FlexItem>
                        <CustomToggleGroup
                            label={LABELS.flexBoxControls.flexWrapLabel}
                            value={attributes?.flexWrap ?? ''}
                            onChange={setFlexWrap}
                        >
                            <CustomToggleGroup.CombinedOption value="nowrap" icon={<FlexWrapNone />} label={LABELS.flexBoxControls.flexWrapNone} />
                            <CustomToggleGroup.CombinedOption value="wrap" icon={<FlexWrapWrap />} label={LABELS.flexBoxControls.flexWrapWrap} />
                            <CustomToggleGroup.CombinedOption value="wrap-reverse" icon={<FlexWrapReverse />} label={LABELS.flexBoxControls.flexWrapReverse} />
                        </CustomToggleGroup>
                    </FlexItem>
                </Flex>
            </PanelBody>
            <PanelBody title={LABELS.flexBoxControls.alignmentLabel} initialOpen={true}>
                <Flex direction="column" className="flexbox-alignment-controls">
                    <FlexItem>
                        { /* RTL aware */ }
                        <JustifyControl
                            attributes={attributes}
                            setJustifyContent={setJustifyContent}
                        />
                    </FlexItem>
                    <FlexItem>
                        { /* RTL aware */ }
                        <AlignControl
                            attributes={attributes}
                            setAlignItems={setAlignItems}
                        />
                    </FlexItem>
                </Flex>
            </PanelBody>
            <PanelBody title={LABELS.flexBoxControls.gapLabel} initialOpen={false}>
                <Flex direction="column" className="flexbox-gap-controls">
                    <FlexItem>
                        <GapControls
                            attributes={attributes}
                            clientId={clientId}
                            updateBlockAttributes={updateBlockAttributes}
                            blockName={name}
                        />
                    </FlexItem>
                </Flex>
            </PanelBody>
        </Panel>
    );
};

const isFlex = (attributes = {}) => {
    const value = attributes?.display ?? '';
    return /^(flex|inline-flex)$/.test(value);
};

export default {
    name: 'flexbox-controls',
    title: LABELS.flexBoxControls.panelTitle,
    icon: <FlexNoWrapRounded />,
    isVisible: ({ attributes }) => isFlex(attributes),
    render: () => <FlexBoxControls />,
};