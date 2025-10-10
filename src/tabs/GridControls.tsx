import { useState, useCallback, useEffect, useMemo } from "@wordpress/element";
import { useDispatch } from "@wordpress/data";
import { Panel, PanelBody, Flex, FlexBlock, Button, Modal } from "@wordpress/components";

import {
    useAttrGetter,
    useSelectedBlockInfo,
    useSafeBlockName,
    useScopedKey,
    useUIPreferences,
} from "@hooks";
import { LABELS } from "@labels";
import type { GridAxisModeKey, VisibilityCtx } from "@types";

import GapControls from "@components/composite/GapControls";
import TokenGrid from "@components/Tokens/TokenGrid";
import PanelToggle from "@components/composite/PanelToggle";
import SubGridToggle from "@components/composite/SubGridToggle";

import { GridAxisSimple } from "@panels/GridAxisSimple";
import { GridAxisTracks } from "@panels/GridAxisTracks";
import { MaterialSymbolsBackgroundGridSmall as GridIcon } from "@assets/icons";

const GridControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const name = selectedBlock?.name;
    const safeBlockName = useSafeBlockName(name, clientId ?? undefined);

    // Bail out until block scope is ready: prevents wrong pref keys + TS unions.
    if (!name || !safeBlockName || !clientId) return null;

    const { getString } = useAttrGetter(clientId ?? null);

    //const [activeKey, setActiveKey] = useState<GridAxisModeKey | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);

    const openModal = useCallback(() => setModalOpen(true), []);
    const closeModal = useCallback(() => setModalOpen(false), []);

    const subgridCols = getString("gridTemplateColumns", "", { raw: true }) === "subgrid";
    const subgridRows = getString("gridTemplateRows", "", { raw: true }) === "subgrid";

    const [axisDisabled, setAxisDisabled] = useState({ columns: subgridCols, rows: subgridRows });

    const gridTemplateKey = useScopedKey("gridTemplatePanelOpen", { blockName: safeBlockName });
    const gridGapKey = useScopedKey("gridGapPanelOpen", { blockName: safeBlockName });
    const gridTemplateAreasKey = useScopedKey("gridTemplateAreasPanelOpen", {
        blockName: safeBlockName,
    });

    const [gridTemplatePanelOpen, setGridTemplatePanelOpen] = useUIPreferences(
        gridTemplateKey,
        true
    );
    const [gridGapPanelOpen, setGridGapPanelOpen] = useUIPreferences(gridGapKey, false);
    const [gridTemplateAreasPanelOpen, setGridTemplateAreasPanelOpen] = useUIPreferences(
        gridTemplateAreasKey,
        false
    );

    // Grid Axis sub-panel mode
    const panelsMap = useMemo(
        () =>
            ({
                simple: GridAxisSimple,
                tracks: GridAxisTracks,
            }) as const,
        []
    );
    const panelKeys = useMemo(() => Object.keys(panelsMap) as Array<GridAxisModeKey>, [panelsMap]);
    const firstKey = panelKeys[0]!;
    const ready = !!name && !!safeBlockName && !!clientId;

    const axisPrefKey = useScopedKey("gridAxisPanelMode", { blockName: safeBlockName });
    const [axisStoredKey, setAxisStoredKey] = useUIPreferences<GridAxisModeKey | null>(
        axisPrefKey,
        null
    );

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

    // keep axisDisabled in sync if source attrs change
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
                    <PanelToggle.TextOption
                        value="simple"
                        label={LABELS.gridControls.simplePanel.title}
                    />
                    <PanelToggle.TextOption
                        value="tracks"
                        label={LABELS.gridControls.tracksPanel.title}
                    />
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
