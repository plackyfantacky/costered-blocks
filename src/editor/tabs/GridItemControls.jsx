import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexBlock } from '@wordpress/components';
import { useState, useCallback } from '@wordpress/element';

import { useSelectedBlockInfo, useAttrSetter, useParentAttrs, scopedKey, useUIPreferences, useSafeBlockName } from "@hooks";
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
    const unitModePrefKey = scopedKey('activeGridItemPanel', { blockName: safeBlockName });
    const [activeGridItemPanel, setActiveGridItemPanel] = useUIPreferences(unitModePrefKey, 'simple');

    const setAlignSelf = useCallback((v) => set('alignSelf', v), [set]);
    const setJustifySelf = useCallback((v) => set('justifySelf', v), [set]);
    const setOrder = useCallback((v) => set('order', v), [set]);

    return (
        <Panel className="costered-blocks-grid-item-controls--panel">
            <PanelBody title={LABELS.gridItemsControls.panelTitle}>
                <Flex expanded={true} gap={4} direction="column" className="costered-blocks-grid-item-controls--mode-panel">
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
                            panelProps={{ clientId, attributes, parentAttrs }}
                        >
                            <PanelToggle.TextOption value="simple" label={LABELS.gridItemsControls.simplePanel} />
                            <PanelToggle.TextOption value="tracks" label={LABELS.gridItemsControls.tracksPanel} />
                            <PanelToggle.TextOption value="areas" label={LABELS.gridItemsControls.areasPanel} />
                        </PanelToggle>
                    </FlexBlock>
                </Flex>
            </PanelBody>
            <PanelBody title={LABELS.gridItemsControls.panelAlignment} initialOpen={true}>
                <Flex expanded={true} gap={4} direction="column" className="costered-blocks-grid-item-controls--alignment-panel">
                    <FlexBlock className={'costered-blocks-grid-item-simple-controls--justifyself'}>
                        { /* RTL aware */ }
                        <JustifySelfControl
                            attributes={attributes}
                            setJustifySelf={setJustifySelf}
                        />
                    </FlexBlock>
                    <FlexBlock className={'costered-blocks-grid-item-simple-controls--alignself'}>
                        { /* RTL aware */ }
                        <AlignSelfControl
                            attributes={attributes}
                            setAlignSelf={setAlignSelf}
                        />
                    </FlexBlock>
                </Flex>
            </PanelBody>
            <PanelBody title={LABELS.gridItemsControls.panelOrder} initialOpen={true}>
                <Flex expanded={true} gap={4} direction="column" className="costered-blocks-grid-item-controls--order-panel">   
                    <FlexBlock className={'costered-blocks-grid-item-simple-controls--order'}>
                        <NumberControlInput
                            label={LABELS.gridItemsControls.order}
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