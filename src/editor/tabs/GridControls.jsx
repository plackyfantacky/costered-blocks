import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import {
    Panel, PanelBody, Flex, FlexBlock, FlexItem,
    RangeControl,
    __experimentalHeading as Heading,
    __experimentalText as Text
} from '@wordpress/components';
import { useCallback, useEffect } from '@wordpress/element';

import {
    useSelectedBlockInfo,
    useUIPreferences, scopedKey, useSafeBlockName,
    useAttrSetter,
    useGridTemplateValue
} from "@hooks";
import GridColumnsEditModeControl from "@components/composite/GridColumnsEditModeControl";
import GridRowsEditModeControl from "@components/composite/GridRowsEditModeControl";

import { GapControls } from "@components/composite/GapControls";
import TextControlInput from "@components/TextControlInput";
import NumberControlInput from "@components/NumberControlInput";

import {
    MaterialSymbolsGridViewRounded as GridViewRounded
} from "@assets/icons";

const GridControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { attributes, name } = selectedBlock;
    if (!selectedBlock) return null;

    return (
        <GridControlsInner
            clientId={clientId}
            attributes={attributes}
            name={name}
        />
    );
};

const GridControlsInner = ({ clientId, attributes, name }) => {
    const { updateBlockAttributes } = useDispatch('core/block-editor');
    const { set } = useAttrSetter(updateBlockAttributes, clientId);

    const safeBlockName = useSafeBlockName(name, clientId);
    const gridColumnModeKey = scopedKey('gridTemplateColumnsMode', { blockName: safeBlockName });
    const [templateColumnMode, setTemplateColumnMode] = useUIPreferences(gridColumnModeKey, 'unit');

    const gridRowModeKey = scopedKey('gridTemplateRowsMode', { blockName: safeBlockName });
    const [templateRowMode, setTemplateRowMode] = useUIPreferences(gridRowModeKey, 'unit');

    const setSimpleColumns = useCallback((value) => set('gridTemplateColumns', value > 1 ? `repeat(${value}, 1fr)` : '1fr'), [set]);
    const setSimpleRows = useCallback((value) => set('gridTemplateRows', value > 1 ? `repeat(${value}, 1fr)` : '1fr'), [set]);

    const getSimpleColumns = useCallback(() => useGridTemplateValue(attributes?.gridTemplateColumns ?? ''), [attributes]);
    const getSimpleRows = useCallback(() => useGridTemplateValue(attributes?.gridTemplateRows ?? ''), [attributes]);

    const setCustomColumns = useCallback((value) => set('gridTemplateColumns', value), [set]);
    const setCustomRows = useCallback((value) => set('gridTemplateRows', value), [set]);

    const maxInteger = Number.MAX_SAFE_INTEGER;

    return (
        <Panel>
            <PanelBody title={__('Columns', 'costered-blocks')} initialOpen={true}>
                <Flex direction="column" expanded={true}>
                    <FlexBlock>
                        <GridColumnsEditModeControl clientId={clientId} name={name} />
                    </FlexBlock>
                    {templateColumnMode == "simple" && (
                        <FlexBlock>
                            <RangeControl
                                className="costered-blocks--grid-columns-simple-control"
                                label={__('Number of Columns', 'costered-blocks')}
                                value={getSimpleColumns()}
                                onChange={setSimpleColumns}
                                initialPosition={1}
                                min={1}
                                max={12}
                                step={1}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                        </FlexBlock>
                    )}
                    {templateColumnMode == "custom" && (
                        <FlexBlock>
                            <TextControlInput
                                label={__('Grid Template Columns', 'costered-blocks')}
                                value={attributes?.gridTemplateColumns ?? ''}
                                onChange={setCustomColumns}
                                help={__('Define the column structure using CSS grid syntax. E.g., "1fr 2fr 1fr" or "100px 200px auto".', 'costered-blocks')}
                            />
                        </FlexBlock>
                    )}
                </Flex>
            </PanelBody>
            <PanelBody title={__('Rows', 'costered-blocks')} initialOpen={true}>
                <Flex direction="column" expanded={true}>
                    <FlexBlock style={{ marginTop: '1em' }}>
                        <GridRowsEditModeControl
                            clientId={clientId}
                            name={name}
                            preferenceKey={gridRowModeKey}
                            label={__('Row Mode', 'costered-blocks')}
                        />
                    </FlexBlock>
                    {templateRowMode == "simple" && (
                        <FlexBlock>
                            <NumberControlInput
                                className="costered-blocks--grid-rows-simple-control"
                                label={__('Number of Rows', 'costered-blocks')}
                                value={getSimpleRows()}
                                onChange={setSimpleRows}
                                initialPosition={1}
                                min={1}
                                max={maxInteger}
                                step={1}
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                        </FlexBlock>
                    )}
                    {templateRowMode == "custom" && (
                        <FlexBlock>
                            <TextControlInput
                                label={__('Grid Template Rows', 'costered-blocks')}
                                value={attributes?.gridTemplateRows ?? ''}
                                onChange={setCustomRows}
                                help={__('Define the row structure using CSS grid syntax. E.g., "1fr 2fr 1fr" or "100px 200px auto".', 'costered-blocks')}
                            />
                        </FlexBlock>
                    )}
                </Flex>
            </PanelBody>
            <PanelBody title={__('Gap', 'costered-blocks')} initialOpen={true}>
                <Flex direction="column" expanded={true}>
                    <FlexBlock>
                        <GapControls
                            attributes={attributes}
                            clientId={clientId}
                            updateAttributes={updateBlockAttributes}
                            blockName={name}
                        />
                    </FlexBlock>
                </Flex>
            </PanelBody>
        </Panel>
    );
};

const isGrid = (attributes = {}) => {
    const value = attributes?.display ?? attributes?.style?.display ?? '';
    return /^(grid|inline-grid)$/.test(value);
};

export default {
    name: 'grid-controls',
    title: __('Grid Controls', 'costered-blocks'),
    icon: <GridViewRounded />,
    isVisible: ({ attributes }) => isGrid(attributes),
    render: () => <GridControls />,
};