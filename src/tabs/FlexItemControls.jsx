import { Panel, PanelBody, Flex, FlexBlock, FlexItem } from '@wordpress/components';
import { useCallback } from '@wordpress/element';

import { useAttrGetter, useAttrSetter, useSelectedBlockInfo, useParentAttrs } from "@hooks";
import { FluentRowChild16Regular as FlexChildItem } from "@assets/icons";
import { LABELS } from "@labels";

import NumberControlInput from '@components/NumberControlInput';
import UnitControlInput from '@components/UnitControlInput';
import AlignSelfControl from "@components/RtlAware/AlignSelfControl";

const maxInteger = Number.MAX_SAFE_INTEGER;
const minInteger = -maxInteger;

const FlexItemControls = () => {
    const { clientId } = useSelectedBlockInfo();
    const { parentAttrs } = useParentAttrs(clientId);

    const { get } = useAttrGetter(clientId);
    const { set } = useAttrSetter(clientId);

    const isRow = parentAttrs?.flexDirection ? parentAttrs.flexDirection.includes('row') : true;


    const flexGrow = get('flexGrow') || 0;
    const setFlexGrow = useCallback((value) => set('flexGrow', value), [set]);

    const flexShrink = get('flexShrink') || 0;
    const setFlexShrink = useCallback((value) => set('flexShrink', value), [set]);

    const flexBasis = get('flexBasis') ?? '';
    const setFlexBasis = useCallback((value) => set('flexBasis', value), [set]);

    const order = get('order') || 0;
    const setOrder = useCallback((value) => set('order', value), [set]);

    const alignSelf = get('alignSelf') || 'auto';
    const setAlignSelf = useCallback((value) => set('alignSelf', value), [set]);

    return (
        <Panel className="costered-blocks--tab--flexitem-controls">
            <PanelBody title={LABELS.flexItemControls.panelTitle} initialOpen={true} className="costered-blocks--flexitem-controls-inner">
                <Flex expanded={true} gap={4} direction="column">
                    <FlexBlock className="costered-blocks--flexitem-controls--flex">
                        <Flex expanded={true} gap={0} direction="row">
                            <FlexItem>
                                <NumberControlInput
                                    label={LABELS.flexItemControls.flexGrow}
                                    value={flexGrow}
                                    onChange={setFlexGrow}
                                    step={0.1} min={0} max={10}
                                />
                            </FlexItem>
                            <FlexItem>
                                <NumberControlInput
                                    label={LABELS.flexItemControls.flexShrink}
                                    value={flexShrink}
                                    onChange={setFlexShrink}
                                    step={0.1} min={0} max={10}
                                />
                            </FlexItem>
                            <FlexBlock>
                                <UnitControlInput
                                    label={LABELS.flexItemControls.flexBasis}
                                    value={flexBasis}
                                    onChange={setFlexBasis}
                                    placeholder={LABELS.flexItemControls.flexBasisPlaceholder}
                                />
                            </FlexBlock>
                        </Flex>
                    </FlexBlock>
                    <FlexBlock className="costered-blocks--flexitem-controls--order">
                        <NumberControlInput
                            label={LABELS.flexItemControls.order}
                            value={order}
                            onChange={setOrder}
                            step={1} min={minInteger} max={maxInteger}
                        />
                    </FlexBlock>
                    {isRow && (
                        <FlexBlock className="costered-blocks--flexitem-controls--alignself">
                            <AlignSelfControl
                                value={alignSelf}
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
    isVisible: ({ parentAttrs } = {}) => {
        // Prefer responsive-aware read; fallback to legacy top-level
        const value = (typeof parentAttrs?.$get === 'function'
            ? parentAttrs.$get('display', { cascade: true })
            : parentAttrs?.display) ?? '';
        return /^(flex|inline-flex)$/i.test(String(value).trim());
    },
    render: () => <FlexItemControls />,
};