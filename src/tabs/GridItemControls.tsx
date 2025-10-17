
import { Panel, PanelBody, Flex, FlexBlock } from '@wordpress/components';
import { useState, useCallback, useMemo } from '@wordpress/element';

import { useAttrGetter, useAttrSetter, useSelectedBlockInfo, 
    useScopedKey, useUIPreferences, useSafeBlockName } from "@hooks";
import { LABELS } from "@labels";
import { FluentTableCellCenter24Regular as GridItem } from "@assets/icons";

import PanelToggle from '@components/composite/PanelToggle';
import JustifySelfControl from "@components/RtlAware/JustifySelfControl";
import AlignSelfControl from "@components/RtlAware/AlignSelfControl";
import NumberControlInput from '@components/NumberControlInput';

import { GridItemSimple } from '@panels/GridItemSimple';
import { GridItemTracks } from '@panels/GridItemTracks';
import { GridItemAreas } from '@panels/GridItemAreas';

import type { GridItemPanelKey, VisibilityCtx } from "@types";
import { useEffect } from "react";

const maxInteger = Number.MAX_SAFE_INTEGER;
const minInteger = -maxInteger;

const GridItemControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    if (!clientId) return null;

    const name = selectedBlock?.name;
    const blockName = useSafeBlockName(name, clientId);
    if (!name || !blockName) return null;

    const { getString, getNumber } = useAttrGetter(clientId);
    const { set } = useAttrSetter(clientId);

    /* --- unsaved fields --- */

    /* --- panel prefs + mode --- */

    const panelPrefKey = useScopedKey('activeGridItemPanel', { blockName: blockName });
    const [panelStoredKey, setPanelStoredKey] = useUIPreferences<string | null>(panelPrefKey, 'simple');

    /* --- panel mode toggle --- */

    const panelsMap = useMemo(() => ({
        simple: GridItemSimple,
        tracks: GridItemTracks,
        areas: GridItemAreas,
    }), []);
    const panelKeys = useMemo(() => Object.keys(panelsMap) as Array<GridItemPanelKey>, [panelsMap]);
    const firstKey = panelKeys[0]!;

    const axisKeySet = useMemo(() => new Set(panelKeys), [panelKeys]);
    const isValid = (k: unknown): k is GridItemPanelKey =>
        typeof k === "string" && axisKeySet.has(k as GridItemPanelKey);

    const [panelActiveKey, setPanelActiveKey] = useState<GridItemPanelKey>(
        isValid(panelStoredKey) ? panelStoredKey : firstKey
    );

    const handleChange = (next: GridItemPanelKey) => {
        if (!isValid(next) || next === panelActiveKey) return;
        setPanelActiveKey(next);
        setPanelStoredKey(next);
    };
    
    useEffect(() => {
        if (isValid(panelStoredKey) && panelStoredKey !== panelActiveKey) {
            setPanelActiveKey(panelStoredKey);
        }
    }, [panelActiveKey, panelStoredKey]);

    /* --- alignment controls --- */

    const alignSelf = getString('alignSelf', 'auto');
    const setAlignSelf = useCallback((value: string) => {
        set('alignSelf', value === '' ? undefined : value);
    }, [set]);

    /* --- justifySelf control --- */
    
    const justifySelf = getString('justifySelf') || 'auto';
    const setJustifySelf = useCallback((value: string) => {
        set('justifySelf', value === '' ? undefined : value);
    }, [set]);

    /* --- order control --- */

    const order = getNumber('order', 0) ?? 0;
    const setOrder = useCallback((value: number | '') => {
        set('order', value === '' ? undefined : value);
    }, [set]);

    return (
        <Panel className="costered-blocks--tab--griditem-controls">
            <PanelBody title={LABELS.gridItemsControls.panelTitle} className="costered-blocks--griditem-controls--griditem-inner" initialOpen={true}>
                <Flex expanded={true} gap={4} direction="column" className="costered-blocks--griditem-controls--griditem">
                    <FlexBlock>
                        <PanelToggle
                            className={'costered-blocks--griditem-controls--panel-template-mode'}
                            value={panelActiveKey}
                            onChange={handleChange}
                            label={null}
                            forceActive
                            panels={panelsMap}
                            panelProps={{ clientId, blockName }}
                        >
                            <PanelToggle.Composite value="simple">
                                {LABELS.gridItemsControls.simplePanel.title}

                            </PanelToggle.Composite>
                            <PanelToggle.Composite value="tracks">
                                {LABELS.gridItemsControls.tracksPanel.title}

                            </PanelToggle.Composite>
                            <PanelToggle.Composite value="areas">
                                {LABELS.gridItemsControls.areasPanel.title}

                            </PanelToggle.Composite>
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
    isVisible: ({ parentAttrs }: VisibilityCtx = {}) => {
        // Prefer responsive-aware read; fallback to legacy top-level
        const value = (typeof parentAttrs?.$get === 'function'
            ? parentAttrs.$get('display', { cascade: true })
            : parentAttrs?.display) ?? ''
        return /^(grid|inline-grid)$/i.test(String(value).trim());
    },
    render: () => <GridItemControls />,
};