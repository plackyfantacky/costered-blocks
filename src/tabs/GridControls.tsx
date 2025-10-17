import { useState, useCallback, useEffect, useMemo } from "@wordpress/element";
import { Panel, PanelBody, Flex, FlexBlock, Button, Modal, FlexItem } from "@wordpress/components";

import {
    useAttrGetter,
    useSelectedBlockInfo,
    useSafeBlockName,
    useScopedKey,
    useUIPreferences,
    useUnsavedBySource
} from "@hooks";
import { getBlockCosteredId } from '@utils/blockUtils';
import { LABELS } from "@labels";
import type { GridAxisModeKey, VisibilityCtx } from "@types";

import { UnsavedIcon } from "@components/UnsavedIcon";
import GapControls from "@components/composite/GapControls";
import TokenGrid from "@components/Tokens/TokenGrid";
import PanelToggle from "@components/composite/PanelToggle";
import SubGridToggle from "@components/composite/SubGridToggle";

import { GridAxisSimple } from "@panels/GridAxisSimple";
import { GridAxisTracks } from "@panels/GridAxisTracks";
import { MaterialSymbolsBackgroundGridSmall as GridIcon } from "@assets/icons";

const GridControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    if(!clientId) return null;

    const name = selectedBlock?.name;
    const safeBlockName = useSafeBlockName(name, clientId);
    if (!name || !safeBlockName) return null;

    const { getString } = useAttrGetter(clientId);

    /* --- modal ---  */

    const [isModalOpen, setModalOpen] = useState(false);

    const openModal = useCallback(() => setModalOpen(true), []);
    const closeModal = useCallback(() => setModalOpen(false), []);

    /* --- unsaved fields --- */

    const costeredId = getBlockCosteredId(clientId);
    const { hasAny, get } = useUnsavedBySource(costeredId, ['gridTemplateColumns', 'gridTemplateRows']);
    const unsavedSimple = get("simple");
    const unsavedTracks = get("tracks");

    /* --- subgrid detection --- */

    const subgridCols = getString("gridTemplateColumns", "", { raw: true }) === "subgrid";
    const subgridRows = getString("gridTemplateRows", "", { raw: true }) === "subgrid";

    /* --- panel prefs + mode --- */

    const gridTemplateKey = useScopedKey("gridTemplatePanelOpen", { blockName: safeBlockName });
    const gridGapKey = useScopedKey("gridGapPanelOpen", { blockName: safeBlockName });
    const gridTemplateAreasKey = useScopedKey("gridTemplateAreasPanelOpen", { blockName: safeBlockName });
    const axisPrefKey = useScopedKey("gridAxisPanelMode", { blockName: safeBlockName });

    const [gridTemplatePanelOpen, setGridTemplatePanelOpen] = useUIPreferences( gridTemplateKey, true );
    const [gridGapPanelOpen, setGridGapPanelOpen] = useUIPreferences(gridGapKey, false);
    const [gridTemplateAreasPanelOpen, setGridTemplateAreasPanelOpen] = useUIPreferences( gridTemplateAreasKey, false );
    const [axisStoredKey, setAxisStoredKey] = useUIPreferences<GridAxisModeKey | null>( axisPrefKey, null );

    /* --- panel mode toggle --- */

    const panelsMap = useMemo(() =>({
        simple: GridAxisSimple,
        tracks: GridAxisTracks,
    }) as const, []);
    const panelKeys = useMemo(() => Object.keys(panelsMap) as Array<GridAxisModeKey>, [panelsMap]);
    const firstKey = panelKeys[0]!;

    const axisKeySet = useMemo(() => new Set(panelKeys), [panelKeys]);
    const isValid = (k: unknown): k is GridAxisModeKey =>
        typeof k === "string" && axisKeySet.has(k as GridAxisModeKey);

    const [axisActiveKey, setAxisActiveKey] = useState<GridAxisModeKey>(
        isValid(axisStoredKey) ? axisStoredKey : firstKey
    );

    const handleChange = (next: GridAxisModeKey) => {
        if (!isValid(next) || next === axisActiveKey) return;
        setAxisActiveKey(next);
        setAxisStoredKey(next);
    };
    
    useEffect(() => {
        if (isValid(axisStoredKey) && axisStoredKey !== axisActiveKey) {
            setAxisActiveKey(axisStoredKey);
        }
    }, [axisStoredKey, axisActiveKey]);

    /* --- axis disabled state --- */

    const [axisDisabled, setAxisDisabled] = useState({ columns: subgridCols, rows: subgridRows });

    useEffect(() => {
        setAxisDisabled({ columns: subgridCols, rows: subgridRows });
    }, [subgridCols, subgridRows]);

    return (
        <Panel className="costered-blocks--tab--grid-controls">
            <SubGridToggle
                clientId={clientId}
                blockName={safeBlockName}
                onAxisDisableChange={setAxisDisabled}
            />
            <PanelBody
                title={LABELS.gridControls.panelTitle}
                className="costered-blocks--grid-controls--template-axis-inner"
                initialOpen={gridTemplatePanelOpen}
                onToggle={setGridTemplatePanelOpen}
            >
                <PanelToggle
                    className="costered-blocks--grid-controls--template-axis"
                    value={axisActiveKey}
                    onChange={handleChange}
                    label={LABELS.gridControls.templateMode}
                    panels={panelsMap}
                    panelProps={{ clientId, axisDisabled }}
                >
                    <PanelToggle.Composite value="simple">
                        <Flex align="center" gap={4} justify="space-between">
                            <FlexItem>{LABELS.gridControls.simplePanel.title}</FlexItem>
                            { hasAny('simple') && <UnsavedIcon costeredId={costeredId} attrs={unsavedSimple} /> }
                        </Flex>
                    </PanelToggle.Composite>

                    <PanelToggle.Composite value="tracks">
                        <Flex align="center" gap={4} justify="space-between">
                            <FlexItem>{LABELS.gridControls.tracksPanel.title}</FlexItem>
                            { hasAny('tracks') && <UnsavedIcon costeredId={costeredId} attrs={unsavedTracks} /> }
                        </Flex> 
                    </PanelToggle.Composite>
                </PanelToggle>
            </PanelBody>

            <PanelBody
                title={LABELS.gridControls.gapPanel.title}
                className="costered-blocks--grid-controls--gap-inner"
                initialOpen={gridGapPanelOpen}
                onToggle={setGridGapPanelOpen}
            >
                <Flex
                    direction="column"
                    expanded={true}
                    className="costered-blocks--grid-controls--gap"
                >
                    <FlexBlock>
                        <GapControls clientId={clientId as string} blockName={name} />
                    </FlexBlock>
                </Flex>
            </PanelBody>
            <PanelBody
                title={LABELS.gridControls.areasPanel.title}
                className="costered-blocks--grid-controls--template-areas-inner"
                initialOpen={gridTemplateAreasPanelOpen}
                onToggle={setGridTemplateAreasPanelOpen}
            >
                <Flex
                    direction="column"
                    gap={4}
                    className="costered-blocks--grid-controls--template-areas"
                >
                    <TokenGrid
                        clientId={clientId}
                        labels={{
                            tokenGrid: LABELS.gridControls.areasPanel,
                            tokenGridNotice: LABELS.gridControls.areasPanel.noticePanel,
                        }}
                    />
                    <Flex justify="flex-end">
                        <Button variant="secondary" onClick={openModal}>
                            {LABELS.gridControls.areasPanel.editLarge}
                        </Button>
                    </Flex>
                </Flex>
                {isModalOpen && (
                    <Modal
                        title={LABELS.gridControls.areasPanel.title}
                        onRequestClose={closeModal}
                        className="costered-blocks--grid-controls--modal costered-blocks--modal--wide"
                        shouldCloseOnClickOutside={true}
                    >
                        <TokenGrid
                            clientId={clientId}
                            labels={{
                                tokenGrid: LABELS.gridControls.areasPanel,
                                tokenGridNotice: LABELS.gridControls.areasPanel.noticePanel,
                            }}
                        />
                    </Modal>
                )}
            </PanelBody>
        </Panel>
    );
};

const isGrid = (attributes: VisibilityCtx["attributes"] = {}) => {
    const value =
        (typeof attributes?.$get === "function"
            ? (attributes.$get("display") as unknown)
            : (attributes as any)?.display) ?? "";
    return /^(grid|inline-grid)$/i.test(String(value));
};

export default {
    name: "grid-controls",
    title: LABELS.gridControls.panelTitle,
    icon: <GridIcon />,
    isVisible: ({ attributes }: VisibilityCtx = {}) => isGrid(attributes),
    render: () => <GridControls />,
};
