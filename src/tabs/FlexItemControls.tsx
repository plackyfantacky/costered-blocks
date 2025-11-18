import type { ComponentProps } from '@wordpress/element';
import { Panel, PanelBody, Flex, FlexBlock, FlexItem } from '@wordpress/components';
import { useCallback } from '@wordpress/element';

import { useAttrGetter, useAttrSetter, useSelectedBlockInfo, useParentAttrs, useSafeBlockName, useScopedKey, useUIPreferences } from "@hooks";
import { FluentRowChild16Regular as FlexChildItem } from "@assets/icons";
import { LABELS } from "@labels";   

import NumberControlInput from '@components/NumberControlInput';
import UnitControlInput from '@components/UnitControlInput';
import AlignSelfControl from "@components/RtlAware/AlignSelfControl";
import type { VisibilityCtx } from '@types';

const maxInteger = Number.MAX_SAFE_INTEGER;
const minInteger = -maxInteger;


const FlexItemControls = () => {
    const { clientId } = useSelectedBlockInfo();
    const { parentAugmented, parentAttrs } = useParentAttrs(clientId);

    const { getNumber, getString } = useAttrGetter(clientId);
    const { set } = useAttrSetter(clientId);

    const parentGet =
        (parentAugmented as { $get?: (key: string, options?: unknown) => unknown } | null | undefined | undefined)?.$get;
    const parentFlexDirection =
        (typeof parentGet === 'function'
            ? (parentGet('flexDirection', { cascade: true }) as string | undefined)
            : (parentAttrs?.flexDirection as string | undefined) || ''
        );
            
    const isRow = String(parentFlexDirection).includes('row') || parentFlexDirection === '';

    // Preference for flex-basis input mode (unit/text), scoped to this block
    const safeBlockName = useSafeBlockName(undefined, clientId ?? undefined);
    const basisModeKey = useScopedKey('flexBasisMode', { blockName: safeBlockName });
    const [basisMode] = useUIPreferences<'unit' | 'text'>(basisModeKey, 'unit');

    const flexGrow = getNumber('flexGrow', 0) ?? 0;
    const setFlexGrow = useCallback(
        (value: number | '') => {
            set('flexGrow', value === '' ? undefined : value);
        },
        [set]
    );

    const flexShrink = getNumber('flexShrink', 0) ?? 0;
    const setFlexShrink = useCallback(
        (value: number | '') => {
            set('flexShrink', value === '' ? undefined : value);
        },
        [set]
    );

    type UnitOnChange = ComponentProps<typeof UnitControlInput>['onChange'];

    const flexBasis = getString('flexBasis', '') ?? '';
    const setFlexBasis: UnitOnChange = (val) => {
        const s = typeof val === 'number' ? String(val) : (val ?? '');
        set('flexBasis', s === '' ? undefined : s);
    }

    const order = getNumber('order', 0) ?? 0;
    const setOrder = useCallback(
        (value: number | '') => {
            set('order', value === '' ? undefined : value);
        },
        [set]
    );

    const alignSelf = getString('alignSelf', 'auto') ?? 'auto';
    const setAlignSelf = useCallback(
        (value: string) => {
            set('alignSelf', value === '' ? undefined : value);
        },
        [set]
    );

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
    isVisible: ({ parentAttrs }: VisibilityCtx = {}) => {
        // Prefer responsive-aware read; fallback to legacy top-level
        const value = (typeof parentAttrs?.$get === 'function'
            ? parentAttrs.$get('display', { cascade: true })
            : parentAttrs?.display) ?? '';
        return /^(flex|inline-flex)$/i.test(String(value).trim());
    },
    render: () => <FlexItemControls />,
};