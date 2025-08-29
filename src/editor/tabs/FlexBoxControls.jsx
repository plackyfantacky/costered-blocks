import { __, isRTL } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexItem } from '@wordpress/components';
import { useSelectedBlockInfo, useAttrSetter } from "@hooks";
import { useCallback, useEffect, useRef } from '@wordpress/element';

import { CustomSelectControl as SelectControl } from "@components/CustomSelectControl";
import CustomToggleGroup from "@components/CustomToggleGroup";
import { GapControls } from '@components/composite/GapControls';

import {
    MaterialSymbolsFlexNoWrapRounded as FlexNoWrapRounded, 
    FlexDirectionColumn, 
    FlexDirectionColumnReverse, 
    FlexDirectionRow, 
    FlexDirectionRowReverse, 
    FlexWrapNone,
    FlexWrapWrap, 
    FlexWrapReverse, 
    EntypoAlignLeft as FlexJustifyStart, 
    EntypoAlignRight as FlexJustifyEnd, 
    HumbleiconsAlignObjectsCenter as FlexJustifyCenter, 
    MaterialSymbolsAlignJustifySpaceAround as FlexJustifySpaceAround, 
    MaterialSymbolsAlignJustifySpaceBetween as FlexJustifySpaceBetween,
    MaterialSymbolsAlignJustifySpaceEven as FlexJustifySpaceEven, 
    EntypoAlignTop as FlexAlignStart, 
    EntypoAlignBottom as FlexAlignEnd, 
    MaterialSymbolsVerticalAlignCenterRounded as FlexAlignCenter, 
    MaterialSymbolsAlignSpaceAround as FlexAlignSpaceAround, 
    MaterialSymbolsAlignSpaceBetween as FlexAlignSpaceBetween, 
    MaterialSymbolsAlignSpaceEven as FlexAlignSpaceEven
} from "@assets/icons";

const isFlexValue = (v) => /^(flex|inline-flex)$/i.test(v);

const JustifyControl = ({ attributes, setJustifyContent }) => {
    const rtl = isRTL();
    const isRow = attributes?.flexDirection ? attributes.flexDirection.includes('row') : true;

    const StartIcon = isRow ? (rtl ? <FlexJustifyEnd /> : <FlexJustifyStart />) : <FlexAlignStart />;
    const EndIcon = isRow ? (rtl ? <FlexJustifyStart /> : <FlexJustifyEnd />) : <FlexAlignEnd />;
    const CenterIcon = isRow ? <FlexJustifyCenter /> : <FlexAlignCenter />;
    const SpaceAroundIcon = isRow ? <FlexJustifySpaceAround /> : <FlexAlignSpaceAround />;
    const SpaceBetweenIcon = isRow ? <FlexJustifySpaceBetween /> : <FlexAlignSpaceBetween />;
    const SpaceEvenlyIcon = isRow ? <FlexJustifySpaceEven /> : <FlexAlignSpaceEven />;

    return (
        <CustomToggleGroup
            label={__('Justify Content', 'costered-blocks')}
            value={attributes?.justifyContent ?? ''}
            onChange={setJustifyContent}
        >
            <CustomToggleGroup.IconOption value="flex-start" icon={StartIcon} label={__('Start', 'costered-blocks')} />
            <CustomToggleGroup.IconOption value="flex-end" icon={EndIcon} label={__('End', 'costered-blocks')} />
            <CustomToggleGroup.IconOption value="center" icon={CenterIcon} label={__('Center', 'costered-blocks')} />
            <CustomToggleGroup.IconOption value="space-around" icon={SpaceAroundIcon} label={__('Space Around', 'costered-blocks')} />
            <CustomToggleGroup.IconOption value="space-between" icon={SpaceBetweenIcon} label={__('Space Between', 'costered-blocks')} />
            <CustomToggleGroup.IconOption value="space-evenly" icon={SpaceEvenlyIcon} label={__('Space Evenly', 'costered-blocks')} />
        </CustomToggleGroup>
    );
};

const AlignControl = ({ attributes, setAlignItems }) => {
    const rtl = isRTL();
    const isRow = attributes?.flexDirection ? attributes.flexDirection.includes('row') : true;

    const StartIcon = isRow ? (rtl ? <FlexAlignEnd /> : <FlexAlignStart />) : <FlexJustifyStart />;
    const EndIcon = isRow ? (rtl ? <FlexAlignStart /> : <FlexAlignEnd />) : <FlexJustifyEnd />;
    const CenterIcon = isRow ? <FlexAlignCenter /> : <FlexJustifyCenter />;
    const SpaceAroundIcon = isRow ? <FlexAlignSpaceAround /> : <FlexJustifySpaceAround />;
    const SpaceBetweenIcon = isRow ? <FlexAlignSpaceBetween /> : <FlexJustifySpaceBetween />;
    const SpaceEvenlyIcon = isRow ? <FlexAlignSpaceEven /> : <FlexJustifySpaceEven />;

    return (
        <CustomToggleGroup
            label={__('Align Items', 'costered-blocks')}
            value={attributes?.alignItems ?? ''}
            onChange={setAlignItems}
        >
            <CustomToggleGroup.IconOption value="flex-start" icon={StartIcon} label={__('Start', 'costered-blocks')} />
            <CustomToggleGroup.IconOption value="flex-end" icon={EndIcon} label={__('End', 'costered-blocks')} />
            <CustomToggleGroup.IconOption value="center" icon={CenterIcon} label={__('Center', 'costered-blocks')} />
            <CustomToggleGroup.IconOption value="space-around" icon={SpaceAroundIcon} label={__('Space Around', 'costered-blocks')} />
            <CustomToggleGroup.IconOption value="space-between" icon={SpaceBetweenIcon} label={__('Space Between', 'costered-blocks')} />
            <CustomToggleGroup.IconOption value="space-evenly" icon={SpaceEvenlyIcon} label={__('Space Evenly', 'costered-blocks')} />
        </CustomToggleGroup>
    );
};

const FlexBoxControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');
    if (!selectedBlock) return null;

    const { attributes, name } = selectedBlock;
    const { set, setMany } = useAttrSetter(updateBlockAttributes, clientId);

    // Normaliser: react to 'display' and 'flexDirection' attribute changes
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
            <PanelBody title={__('Flexbox Controls', 'costered-blocks')} initialOpen={true}>
                <Flex direction="column" className="flexbox-controls">
                    <FlexItem>
                        <SelectControl
                            label={__('Flex Direction', 'costered-blocks')}
                            value={typeof attributes?.flexDirection === "string" ? attributes.flexDirection : ""}
                            onChange={setFlexDirection}
                        >
                            <SelectControl.Option value="row">{isRTL() ? (<FlexDirectionRowReverse />) : (<FlexDirectionRow />)} {__('Row', 'costered-blocks')}</SelectControl.Option>
                            <SelectControl.Option value="row-reverse">{isRTL() ? (<FlexDirectionRow />) : (<FlexDirectionRowReverse />)} {__('Row Reverse', 'costered-blocks')}</SelectControl.Option>
                            <SelectControl.Option value="column"><FlexDirectionColumn /> {__('Column', 'costered-blocks')}</SelectControl.Option>
                            <SelectControl.Option value="column-reverse"><FlexDirectionColumnReverse /> {__('Column Reverse', 'costered-blocks')}</SelectControl.Option>
                        </SelectControl>
                    </FlexItem>
                    <FlexItem>
                        <CustomToggleGroup
                            label={__('Flex Wrap', 'costered-blocks')}
                            value={attributes?.flexWrap ?? ''}
                            onChange={setFlexWrap}
                        >
                            <CustomToggleGroup.CombinedOption value="nowrap" icon={<FlexWrapNone />} label={__('No Wrap', 'costered-blocks')} />
                            <CustomToggleGroup.CombinedOption value="wrap" icon={<FlexWrapWrap />} label={__('Wrap', 'costered-blocks')} />
                            <CustomToggleGroup.CombinedOption value="wrap-reverse" icon={<FlexWrapReverse />} label={__('Reverse', 'costered-blocks')} />
                        </CustomToggleGroup>
                    </FlexItem>
                </Flex>
            </PanelBody>
            <PanelBody title={__('Alignment', 'costered-blocks')} initialOpen={true}>
                <Flex direction="column" className="flexbox-alignment-controls">
                    <FlexItem>
                        <JustifyControl
                            attributes={attributes}
                            setJustifyContent={setJustifyContent}
                        />
                    </FlexItem>
                    <FlexItem>
                        <AlignControl
                            attributes={attributes}
                            setAlignItems={setAlignItems}
                        />
                    </FlexItem>
                </Flex>
            </PanelBody>
            <PanelBody title={__('Gap', 'costered-blocks')} initialOpen={false}>
                <Flex direction="column" className="flexbox-gap-controls">
                    <FlexItem>
                        <GapControls
                            attributes={attributes}
                            clientId={clientId}
                            updateAttributes={updateBlockAttributes}
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
    title: __('Flexbox Controls', 'costered-blocks'),
    icon: <FlexNoWrapRounded />,
    isVisible: ({ attributes }) => isFlex(attributes),
    render: () => <FlexBoxControls />,
};