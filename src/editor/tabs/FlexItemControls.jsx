import { __, isRTL } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexBlock, FlexItem } from '@wordpress/components';
import { useCallback } from '@wordpress/element';

import {
    AlignSelfBaseline, AlignSelfStretch, FlexChildItem, FlexJustifyStart, FlexJustifyEnd, FlexJustifyCenter,
    FlexJustifySpaceAround, FlexJustifySpaceBetween, FlexAlignStart, FlexAlignEnd, FlexAlignCenter,
    FlexAlignSpaceAround, FlexAlignSpaceBetween
} from "@components/Icons";
import NumberControlInput from '@components/NumberControlInput';
import UnitControlInput from '@components/UnitControlInput';
import CustomToggleGroup from '@components/CustomToggleGroup';

import { useSelectedBlockInfo, useAttrSetter, useParentAttrs } from "@hooks";

const maxInteger = Number.MAX_SAFE_INTEGER;
const minInteger = -maxInteger;

const FlexItemControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');
    if (!selectedBlock) return null;

    const { parentAttrs } = useParentAttrs();
    const { attributes } = selectedBlock;
    const { set } = useAttrSetter(updateBlockAttributes, clientId);


    const isRow = parentAttrs?.flexDirection ? parentAttrs.flexDirection.includes('row') : true;

    const setFlexGrow = useCallback((v) => set('flexGrow', v), [set]);
    const setFlexShrink = useCallback((v) => set('flexShrink', v), [set]);
    const setFlexBasis = useCallback((v) => set('flexBasis', v), [set]);
    const setOrder = useCallback((v) => set('order', v), [set]);
    const setAlignSelf = useCallback((v) => set('alignSelf', v), [set]);
    const setJustifySelf = useCallback((v) => set('justifySelf', v), [set]);

    return (
        <Panel className="costered-blocks-flex-item-controls">
            <PanelBody title={__('Flex Item Controls', 'costered-blocks')}>
                <Flex expanded={true} gap={4} direction="column" className="flex-item-controls">
                    <FlexBlock>
                        <Flex expanded={true} gap={0} direction="row">
                            <FlexItem>
                                <NumberControlInput
                                    label={__('Grow', 'costered-blocks')}
                                    value={attributes?.flexGrow || 0}
                                    onChange={setFlexGrow}
                                    step={0.1} min={0} max={10}
                                />
                            </FlexItem>
                            <FlexItem>
                                <NumberControlInput
                                    label={__('Shrink', 'costered-blocks')}
                                    value={attributes?.flexShrink || 0}
                                    onChange={setFlexShrink}
                                    step={0.1} min={0} max={10}
                                />
                            </FlexItem>
                            <FlexBlock>
                                <UnitControlInput
                                    label={__('Basis', 'costered-blocks')}
                                    value={attributes?.flexBasis || ''}
                                    onChange={setFlexBasis}
                                    placeholder={__('Enter value', 'costered-blocks')}
                                />
                            </FlexBlock>
                        </Flex>
                    </FlexBlock>
                    <FlexBlock>
                        <NumberControlInput
                            label={__('Flex Order', 'costered-blocks')}
                            value={attributes?.order || 0}
                            onChange={setOrder}
                            step={1} min={minInteger} max={maxInteger}
                        />
                    </FlexBlock>
                    {isRow && (
                        <FlexBlock>
                            <CustomToggleGroup
                                label={__('Align Self', 'costered-blocks')}
                                value={attributes?.alignSelf ?? ''}
                                onChange={setAlignSelf}
                            >
                                <CustomToggleGroup.IconOption value="flex-start" icon={<FlexAlignStart />} label={__('Start', 'costered-blocks')} />
                                <CustomToggleGroup.IconOption value="center" icon={<FlexJustifyCenter />} label={__('Center', 'costered-blocks')} />
                                <CustomToggleGroup.IconOption value="flex-end" icon={<FlexAlignEnd />} label={__('End', 'costered-blocks')} />
                                <CustomToggleGroup.IconOption value="baseline" icon={<AlignSelfBaseline />} label={__('Baseline', 'costered-blocks')} />
                                <CustomToggleGroup.IconOption value="stretch" icon={<AlignSelfStretch />} label={__('Stretch', 'costered-blocks')} />
                            </CustomToggleGroup>
                        </FlexBlock>
                    )}
                </Flex>
            </PanelBody>
        </Panel>
    );
};

export default {
    name: 'flex-item-controls',
    title: __('Flex Item Controls', 'costered-blocks'),
    icon: <FlexChildItem />,
    isVisible: ({ parentAttrs } = {}) => ['flex', 'inline-flex'].includes(parentAttrs?.display),
    render: () => <FlexItemControls />,
};