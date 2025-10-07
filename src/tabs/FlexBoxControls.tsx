import { Panel, PanelBody, Flex, FlexItem } from '@wordpress/components';
import { useCallback, useEffect, useRef } from '@wordpress/element';

import { LABELS } from "@labels";
import {
    useAttrGetter, useAttrSetter, useSelectedBlockInfo,
    useSafeBlockName, useScopedKey, useUIPreferences
} from "@hooks";
import {
    MaterialSymbolsFlexNoWrapRounded as FlexNoWrapRounded,
    FlexWrapNone, FlexWrapWrap, FlexWrapReverse
} from "@assets/icons";

import CustomToggleGroup from "@components/CustomToggleGroup";
import FlexDirectionControl from '@components/RtlAware/FlexDirectionControl';
import JustifyControl from '@components/RtlAware/JustifyContentControl';
import AlignControl from '@components/RtlAware/AlignItemsControl';
import GapControls from '@components/composite/GapControls';
import type { VisibilityCtx } from '@types';

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');
const isFlexValue = (value: unknown): boolean => /^(flex|inline-flex)$/i.test(String(value));

const FlexBoxControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    if (!clientId || !selectedBlock) return null;
    
    const name: string = asString((selectedBlock as any).name);

    const { getString } = useAttrGetter(clientId);
    const { set, setMany } = useAttrSetter(clientId);

    // user preferences (panel open/close state)
    const safeBlockName = useSafeBlockName(name, clientId);
    const flexBoxKey = useScopedKey('flexBoxPanelOpen', { blockName: safeBlockName });
    const [flexBoxPanelOpen, setFlexBoxPanelOpen] = useUIPreferences(flexBoxKey, true);

    // Normaliser: respond to 'display' and 'flexDirection' attribute changes
    const prevDisplayRef = useRef(getString('display'));
    useEffect(() => {
        const display = getString('display');
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
    }, [set, setMany]);


    const flexDirection = getString('flexDirection') ?? '';
    const setFlexDirection = useCallback((value: string) => {
        set('flexDirection', value === '' ? undefined : value);
    }, [set]);

    const flexWrap = getString('flexWrap') ?? '';
    const setFlexWrap = useCallback((value: string) => {
        set('flexWrap', value === '' ? undefined : value);
    }, [set]);

    const justifyContent = getString('justifyContent') ?? '';
    const setJustifyContent = useCallback((value: string) => {
        set('justifyContent', value === '' ? undefined : value);
    }, [set]);

    const alignItems = getString('alignItems') ?? '';
    const setAlignItems = useCallback((value: string) => {
        set('alignItems', value === '' ? undefined : value);
    }, [set]);

    return (
        <Panel className="costered-blocks--tab--flexbox-controls">
            <PanelBody title={LABELS.flexBoxControls.panelTitle} className="costered-blocks--flexbox-controls--inner" initialOpen={flexBoxPanelOpen} onToggle={setFlexBoxPanelOpen}>
                <Flex gap={4} direction="column">
                    <FlexItem>
                        { /* RTL aware */}
                        <FlexDirectionControl
                            value={flexDirection}
                            setFlexDirection={setFlexDirection}
                        />
                    </FlexItem>
                    <FlexItem>
                        <CustomToggleGroup
                            label={LABELS.flexBoxControls.flexWrapLabel}
                            value={flexWrap}
                            onChange={setFlexWrap}
                        >
                            <CustomToggleGroup.CombinedOption value="nowrap" icon={<FlexWrapNone />} label={LABELS.flexBoxControls.flexWrapNone} />
                            <CustomToggleGroup.CombinedOption value="wrap" icon={<FlexWrapWrap />} label={LABELS.flexBoxControls.flexWrapWrap} />
                            <CustomToggleGroup.CombinedOption value="wrap-reverse" icon={<FlexWrapReverse />} label={LABELS.flexBoxControls.flexWrapReverse} />
                        </CustomToggleGroup>
                    </FlexItem>
                    <FlexItem>
                        { /* RTL aware */}
                        <JustifyControl
                            value={justifyContent}
                            setJustifyContent={setJustifyContent}
                            clientId={clientId}
                        />
                    </FlexItem>
                    <FlexItem>
                        { /* RTL aware */}
                        <AlignControl
                            value={alignItems}
                            setAlignItems={setAlignItems}
                            clientId={clientId}
                        />
                    </FlexItem>
                    <FlexItem>
                        <GapControls
                            // getter/setter inside GapControls
                            clientId={clientId}
                            blockName={name}
                        />
                    </FlexItem>
                </Flex>
            </PanelBody>
        </Panel>
    );
};

export default {
    name: 'flexbox-controls',
    title: LABELS.flexBoxControls.panelTitle,
    icon: <FlexNoWrapRounded />,
    isVisible: ({ attributes }: VisibilityCtx) => {
        // Prefer responsive-aware read; fallback to legacy top-level
        const value = 
            (typeof attributes?.$get === 'function'
                ? attributes.$get('display')
                : attributes?.display) ?? '';
        return /^(flex|inline-flex)$/i.test(String(value));
    },
    render: () => <FlexBoxControls />,
};