import { Panel, PanelBody, Flex, FlexItem, FlexBlock, BaseControl } from '@wordpress/components';
import { useCallback } from '@wordpress/element';

import { useAttrGetter, useAttrSetter, useSelectedBlockInfo } from "@hooks";
import { LABELS } from "@labels";
import {
    MaterialSymbolsRemoveSelectionRounded as DefaultIcon,
    Position,
    PositionAbsolute,
    PositionFixed,
    PositionRelative,
    PositionSticky,
    PositionStatic
} from "@assets/icons";

import CustomToggleGrid from "@components/CustomToggleGrid";
import DirectionalInputGroup from "@components/composite/DirectionalInputGroup";
import NumberControlInput from '@components/NumberControlInput';

const maxInteger = Number.MAX_SAFE_INTEGER;
const minInteger = -maxInteger;

const PositioningControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    if (!clientId || !selectedBlock) return null;
    
    const { name } = selectedBlock;

    const { get } = useAttrGetter(clientId);
    const { set } = useAttrSetter(clientId);

    const position: string = String(get("position") || "");
    const setPosition = useCallback((value: string) => set("position", value), [set]);

    const rawZ = get("zIndex");
    const zIndex: number | '' = 
        rawZ === '' || rawZ === null
            ? ''
            : Number.isFinite(Number(rawZ)) ? Number(rawZ) : '';

    const setZIndex = useCallback((value: number | '') => {
        set("zIndex", value === '' ? undefined : value);
    }, [set]);

    const showOffsets = position !== '' && position.toLowerCase() !== 'static';

    return (
        <Panel className="costered-blocks--tab--positioning-controls">
            <PanelBody title={LABELS.positioningControls.panelTitle} className="costered-blocks--positioning-controls--inner" initialOpen={true}>
                <Flex direction="column" gap={4} className="costered-blocks--positioning-controls--position">
                    <FlexItem>
                        <CustomToggleGrid
                            label={LABELS.positioningControls.position.label}
                            value={position}
                            onChange={setPosition}
                            help={LABELS.positioningControls.position.help}
                            isDeselectable={false}
                        >
                            <CustomToggleGrid.CompositeOption value="" label={LABELS.positioningControls.position.values.unset}>
                                <DefaultIcon size={32} />
                                {LABELS.positioningControls.position.values.unset}
                            </CustomToggleGrid.CompositeOption>
                            <CustomToggleGrid.CompositeOption value="static" label={LABELS.positioningControls.position.values.static}>
                                <PositionStatic size={32} />
                                {LABELS.positioningControls.position.values.static}
                            </CustomToggleGrid.CompositeOption>
                            <CustomToggleGrid.CompositeOption value="relative" label={LABELS.positioningControls.position.values.relative}>
                                <PositionRelative size={32} />
                                {LABELS.positioningControls.position.values.relative}
                            </CustomToggleGrid.CompositeOption>
                            <CustomToggleGrid.CompositeOption value="absolute" label={LABELS.positioningControls.position.values.absolute}>
                                <PositionAbsolute size={32} />
                                {LABELS.positioningControls.position.values.absolute}
                            </CustomToggleGrid.CompositeOption>
                            <CustomToggleGrid.CompositeOption value="fixed" label={LABELS.positioningControls.position.values.fixed}>
                                <PositionFixed size={32} />
                                {LABELS.positioningControls.position.values.fixed}
                            </CustomToggleGrid.CompositeOption>
                            <CustomToggleGrid.CompositeOption value="sticky" label={LABELS.positioningControls.position.values.sticky}>
                                <PositionSticky size={32} />
                                {LABELS.positioningControls.position.values.sticky}
                            </CustomToggleGrid.CompositeOption>
                        </CustomToggleGrid>
                    </FlexItem>
                    { /* Future idea: offset controls (top/right/bottom/left) - only show if position is not unset or static */ }
                    <FlexBlock>
                        <BaseControl
                            label={LABELS.positioningControls.coordinates.label}
                            help={LABELS.positioningControls.coordinates.help}
                            __nextHasNoMarginBottom
                        >  
                            <DirectionalInputGroup
                                clientId={clientId}
                                blockName={name}
                            />
                        </BaseControl>
                    </FlexBlock>
                    <FlexBlock>
                        <NumberControlInput
                            label={LABELS.positioningControls.zIndex.label}
                            value={zIndex}
                            onChange={setZIndex}
                            step={1} min={minInteger} max={maxInteger}
                            help={LABELS.positioningControls.zIndex.help}
                        />
                    </FlexBlock>
                </Flex>
            </PanelBody>
        </Panel>
    );    
}

export default {
    name: "positioning-controls",
    title: LABELS.positioningControls.panelTitle,
    icon: <Position />,
    render: () => <PositioningControls />
};

