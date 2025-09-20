import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexBlock } from '@wordpress/components';
import { useState, useCallback } from '@wordpress/element';

import { useSelectedBlockInfo, useAttrSetter, useParentAttrs, useScopedKey, useUIPreferences, useSafeBlockName } from "@hooks";
import { LABELS } from "@labels";
import { F7Rectangle3OffgridFill as GridItem } from "@assets/icons";

import PanelToggle from '@components/composite/PanelToggle';
import JustifySelfControl from "@components/RtlAware/JustifySelfControl";
import AlignSelfControl from "@components/RtlAware/AlignSelfControl";
import NumberControlInput from '@components/NumberControlInput';

import { GridItemSimple } from '@panels/GridItemSimple';
import { GridItemTracks } from '@panels/GridItemTracks';
import { GridItemAreas } from '@panels/GridItemAreas';

const maxInteger = Number.MAX_SAFE_INTEGER;
const minInteger = -maxInteger;

const GridItemControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');
    if (!selectedBlock) return null;

    const { parentAttrs } = useParentAttrs();
    const { attributes, blockName } = selectedBlock;
    const { set } = useAttrSetter(updateBlockAttributes, clientId);

    const safeBlockName = useSafeBlockName(blockName, clientId);
    const preferenceKey = useScopedKey('activeGridItemPanel', { blockName: safeBlockName });
    const [activeGridItemPanel, setActiveGridItemPanel] = useUIPreferences(preferenceKey, 'simple');

    const setAlignSelf = useCallback((v) => set('alignSelf', v), [set]);
    const setJustifySelf = useCallback((v) => set('justifySelf', v), [set]);
    const setOrder = useCallback((v) => set('order', v), [set]);

    return (
        <Panel className="costered-blocks--tab--griditem-controls">
            <PanelBody title={LABELS.gridItemsControls.panelTitle} className="costered-blocks--griditem-controls--inner" initialOpen={true}>
                <Flex expanded={true} gap={4} direction="column">
                    <FlexBlock>
                        <PanelToggle
                            value={activeGridItemPanel}
                            onChange={setActiveGridItemPanel}
                            label={null}
                            forceActive
                            panels={{
                                simple: GridItemSimple,
                                tracks: GridItemTracks,
                                areas: GridItemAreas,
                            }}
                            panelProps={{ clientId, attributes, parentAttrs, safeBlockName }}
                        >
                            <PanelToggle.TextOption value="simple" label={LABELS.gridItemsControls.simplePanel.title} />
                            <PanelToggle.TextOption value="tracks" label={LABELS.gridItemsControls.tracksPanel.title} />
                            <PanelToggle.TextOption value="areas" label={LABELS.gridItemsControls.areasPanel.title} />
                        </PanelToggle>
                    </FlexBlock>
                </Flex>
            </PanelBody>
            <PanelBody title={LABELS.gridItemsControls.alignmentPanel.title} className="costered-blocks--griditem-controls-alignment" initialOpen={true}>
                <Flex expanded={true} gap={4} direction="column" className="costered-blocks--griditem-controls-alignment-flex">
                    <FlexBlock className={'costered-blocks--griditem-controls--justifyself'}>
                        { /* RTL aware */ }
                        <JustifySelfControl
                            attributes={attributes}
                            setJustifySelf={setJustifySelf}
                        />
                    </FlexBlock>
                    <FlexBlock className={'costered-blocks--griditem-controls--alignself'}>
                        { /* RTL aware */ }
                        <AlignSelfControl
                            attributes={attributes}
                            setAlignSelf={setAlignSelf}
                        />
                    </FlexBlock>
                </Flex>
            </PanelBody>
            <PanelBody title={LABELS.gridItemsControls.orderPanel.title} className="costered-blocks--griditem-controls-order" initialOpen={true}>
                <Flex expanded={true} gap={4} direction="column">   
                    <FlexBlock>
                        <NumberControlInput
                            label={LABELS.gridItemsControls.orderPanel.label}
                            value={attributes?.order || 0}
                            onChange={setOrder}
                            step={1} min={minInteger} max={maxInteger}
                        />
                    </FlexBlock>
                </Flex>
            </PanelBody>
        </Panel>
    );
};

export default {
    name: 'grid-item-controls',
    title: LABELS.gridItemsControls.panelTitle,
    icon: <GridItem />,
    isVisible: ({ parentAttrs } = {}) => ['grid', 'inline-grid'].includes(parentAttrs?.display),
    render: () => <GridItemControls />,
};