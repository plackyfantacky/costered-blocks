import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexBlock, FlexItem } from '@wordpress/components';
import { useCallback } from '@wordpress/element';

import { useSelectedBlockInfo, useAttrSetter, useParentAttrs } from "@hooks";
import { FluentRowChild16Regular as FlexChildItem } from "@assets/icons";
import { LABELS } from "@labels";
import NumberControlInput from '@components/NumberControlInput';
import UnitControlInput from '@components/UnitControlInput';
import AlignSelfControl from "@components/RtlAware/AlignSelfControl";

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

    return (
        <Panel className="costered-blocks-flex-item-controls">
            <PanelBody title={LABELS.flexItemControls.panelTitle} initialOpen={true}>
                <Flex expanded={true} gap={4} direction="column" className="flex-item-controls">
                    <FlexBlock>
                        <Flex expanded={true} gap={0} direction="row">
                            <FlexItem>
                                <NumberControlInput
                                    label={LABELS.flexItemControls.flexGrow}
                                    value={attributes?.flexGrow || 0}
                                    onChange={setFlexGrow}
                                    step={0.1} min={0} max={10}
                                />
                            </FlexItem>
                            <FlexItem>
                                <NumberControlInput
                                    label={LABELS.flexItemControls.flexShrink}
                                    value={attributes?.flexShrink || 0}
                                    onChange={setFlexShrink}
                                    step={0.1} min={0} max={10}
                                />
                            </FlexItem>
                            <FlexBlock>
                                <UnitControlInput
                                    label={LABELS.flexItemControls.flexBasis}
                                    value={attributes?.flexBasis || ''}
                                    onChange={setFlexBasis}
                                    placeholder={LABELS.flexItemControls.flexBasisPlaceholder}
                                />
                            </FlexBlock>
                        </Flex>
                    </FlexBlock>
                    <FlexBlock>
                        <NumberControlInput
                            label={LABELS.flexItemControls.order}
                            value={attributes?.order || 0}
                            onChange={setOrder}
                            step={1} min={minInteger} max={maxInteger}
                        />
                    </FlexBlock>
                    {isRow && (
                        <FlexBlock>
                            <AlignSelfControl
                                attributes={attributes}
                                setAlignSelf={setAlignSelf}
                                includeBaseline={true}
                            />
                        </FlexBlock>
                    )}
                </Flex>
            </PanelBody>
        </Panel>
    );
};

export default {
    name: 'flex-item-controls',
    title: LABELS.flexItemControls.panelTitle,
    icon: <FlexChildItem />,
    isVisible: ({ parentAttrs } = {}) => ['flex', 'inline-flex'].includes(parentAttrs?.display),
    render: () => <FlexItemControls />,
};