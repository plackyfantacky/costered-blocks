import { useState, useCallback } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexBlock, Button, Modal } from '@wordpress/components';

import { useAttrGetter, useSelectedBlockInfo, useSafeBlockName, useScopedKey, useUIPreferences } from "@hooks";
import { LABELS } from "@labels";
import type { GridAxisModeKey, VisibilityCtx } from "@types";

import GapControls from '@components/composite/GapControls';
import TokenGrid from '@components/composite/TokenGrid';
import PanelToggle from '@components/composite/PanelToggle';
import SubGridToggle from "@components/composite/SubGridToggle";

import { GridAxisSimple } from '@panels/GridAxisSimple';
import { GridAxisTracks } from '@panels/GridAxisTracks';
import { MaterialSymbolsBackgroundGridSmall as GridIcon } from "@assets/icons";


const GridControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const name = selectedBlock?.name;

    const { getString } = useAttrGetter(clientId ?? null);

    const [activeKey, setActiveKey] = useState<GridAxisModeKey | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);

    const openModal = useCallback(() => setModalOpen(true), []);
    const closeModal = useCallback(() => setModalOpen(false), []);

    const safeBlockName = useSafeBlockName(name, clientId ?? undefined);
    const gridTemplateKey = useScopedKey('gridTemplatePanelOpen', { blockName: safeBlockName });
    const gridGapKey = useScopedKey('gridGapPanelOpen', { blockName: safeBlockName });
    const gridTemplateAreasKey = useScopedKey('gridTemplateAreasPanelOpen', { blockName: safeBlockName });
    
    const [gridTemplatePanelOpen, setGridTemplatePanelOpen] = useUIPreferences(gridTemplateKey, true);
    const [gridGapPanelOpen, setGridGapPanelOpen] = useUIPreferences(gridGapKey, false);
    const [gridTemplateAreasPanelOpen, setGridTemplateAreasPanelOpen] = useUIPreferences(gridTemplateAreasKey, false);

    const subgridCols = getString('gridTemplateColumns', '', {raw: true}) === 'subgrid';
    const subgridRows = getString('gridTemplateRows', '', {raw: true}) === 'subgrid';

    const [axisDisabled, setAxisDisabled] = useState({ columns: subgridCols, rows: subgridRows });

    return (
        <Panel className="costered-blocks--tab--grid-controls">
            <SubGridToggle clientId={clientId} blockName={safeBlockName} onAxisDisableChange={setAxisDisabled} />
            <PanelBody title={LABELS.gridControls.panelTitle} className="costered-blocks--grid-controls--template-axis-inner" initialOpen={gridTemplatePanelOpen} onToggle={setGridTemplatePanelOpen}>
                <PanelToggle
                    className="costered-blocks--grid-controls--template-axis"
                    value={activeKey}
                    onChange={setActiveKey}
                    label={LABELS.gridControls.templateMode}
                    forceActive
                    panels={{
                        simple: GridAxisSimple,
                        tracks: GridAxisTracks,
                    }}
                    panelProps={{ clientId, axisDisabled }}
                >
                    <PanelToggle.TextOption value="simple" label={LABELS.gridControls.simplePanel.title} />
                    <PanelToggle.TextOption value="tracks" label={LABELS.gridControls.tracksPanel.title} />
                </PanelToggle>
            </PanelBody>
            <PanelBody title={LABELS.gridControls.gapPanel.title} className="costered-blocks--grid-controls--gap-inner" initialOpen={gridGapPanelOpen} onToggle={setGridGapPanelOpen}>
                <Flex direction="column" expanded={true} className="costered-blocks--grid-controls--gap">
                    <FlexBlock>
                        <GapControls
                            clientId={clientId as string}
                            blockName={name}
                        />
                    </FlexBlock>
                </Flex>
            </PanelBody>
            <PanelBody title={LABELS.gridControls.areasPanel.title} className="costered-blocks--grid-controls--template-areas-inner" initialOpen={gridTemplateAreasPanelOpen} onToggle={setGridTemplateAreasPanelOpen}>
                <Flex direction="column" gap={4} className="costered-blocks--grid-controls--template-areas">
                    <TokenGrid
                        clientId={clientId}
                        labels={{
                            tokenGrid: LABELS.gridControls.areasPanel,
                            tokenGridNotice: LABELS.gridControls.areasPanel.noticePanel
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
                                tokenGridNotice: LABELS.gridControls.areasPanel.noticePanel
                            }}
                        />
                    </Modal>
                )}
            </PanelBody>
        </Panel>
    );
};

const isGrid = (attributes: VisibilityCtx['attributes'] = {}) => {
    const value = 
        (typeof attributes?.$get === 'function'
            ? (attributes.$get('display') as unknown)
            : (attributes as any)?.display) ?? '';
    return /^(grid|inline-grid)$/i.test(String(value));
};

export default {
    name: 'grid-controls',
    title: LABELS.gridControls.panelTitle,
    icon: <GridIcon />,
    isVisible: ({ attributes }: VisibilityCtx = {}) => isGrid(attributes),
    render: () => <GridControls />,
};