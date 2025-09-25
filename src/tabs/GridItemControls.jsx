
import { Panel, PanelBody, Flex, FlexBlock } from '@wordpress/components';
import { useCallback } from '@wordpress/element';

import { useAttrGetter, useAttrSetter, useSelectedBlockInfo, 
    useScopedKey, useUIPreferences, useSafeBlockName } from "@hooks";
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
    const { name } = selectedBlock;

    const { get } = useAttrGetter(clientId);
    const { set } = useAttrSetter(clientId);

    const blockName = useSafeBlockName(name, clientId);
    const preferenceKey = useScopedKey('activeGridItemPanel', { blockName: blockName });
    const [activeGridItemPanel, setActiveGridItemPanel] = useUIPreferences(preferenceKey, 'simple');

    const alignSelf = get('alignSelf') || 'auto';
    const setAlignSelf = useCallback((value) => set('alignSelf', value), [set]);

    const justifySelf = get('justifySelf') || 'auto';
    const setJustifySelf = useCallback((value) => set('justifySelf', value), [set]);
    
    const order = get('order') || 0;
    const setOrder = useCallback((value) => set('order', value), [set]);

    return (
        <Panel className="costered-blocks--tab--griditem-controls">
            <PanelBody title={LABELS.gridItemsControls.panelTitle} className="costered-blocks--griditem-controls--griditem-inner" initialOpen={true}>
                <Flex expanded={true} gap={4} direction="column" className="costered-blocks--griditem-controls--griditem">
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
                            panelProps={{ clientId, blockName }}
                        >
                            <PanelToggle.TextOption value="simple" label={LABELS.gridItemsControls.simplePanel.title} />
                            <PanelToggle.TextOption value="tracks" label={LABELS.gridItemsControls.tracksPanel.title} />
                            <PanelToggle.TextOption value="areas" label={LABELS.gridItemsControls.areasPanel.title} />
                        </PanelToggle>
                    </FlexBlock>
                </Flex>
            </PanelBody>
            <PanelBody title={LABELS.gridItemsControls.alignmentPanel.title} className="costered-blocks--griditem-controls--alignment-inner" initialOpen={true}>
                <Flex expanded={true} gap={4} direction="column" className="costered-blocks--griditem-controls--alignment">
                    <FlexBlock className={'costered-blocks--griditem-controls--justifyself'}>
                        { /* RTL aware */ }
                        <JustifySelfControl
                            value={justifySelf}
                            setJustifySelf={setJustifySelf}
                        />
                    </FlexBlock>
                    <FlexBlock className={'costered-blocks--griditem-controls--alignself'}>
                        { /* RTL aware */ }
                        <AlignSelfControl
                            value={alignSelf}
                            setAlignSelf={setAlignSelf}
                        />
                    </FlexBlock>
                </Flex>
            </PanelBody>
            <PanelBody title={LABELS.gridItemsControls.orderPanel.title} className="costered-blocks--griditem-controls--order-inner" initialOpen={true}>
                <Flex expanded={true} gap={4} direction="column" className="costered-blocks--griditem-controls--order">
                    <FlexBlock>
                        <NumberControlInput
                            label={LABELS.gridItemsControls.orderPanel.label}
                            value={order || 0}
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
    isVisible: ({ parentAttrs } = {}) => {
        // Prefer responsive-aware read; fallback to legacy top-level
        const value = (typeof parentAttrs?.$get === 'function'
            ? parentAttrs.$get('display', { cascade: true })
            : parentAttrs?.display) ?? ''
        return /^(grid|inline-grid)$/i.test(String(value).trim());
    },
    render: () => <GridItemControls />,
};