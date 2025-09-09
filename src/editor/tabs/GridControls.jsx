import { useState, useCallback } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexBlock, Button, Modal } from '@wordpress/components';

import { useSelectedBlockInfo } from "@hooks";
import { LABELS } from "@labels";
import { GapControls } from '@components/composite/GapControls';
import { TokenGrid } from '@components/composite/TokenGrid';
import PanelToggle from '@components/composite/PanelToggle';

import { GridAxisSimple } from '@panels/GridAxisSimple';
import { GridAxisTracks } from '@panels/GridAxisTracks';

import { MaterialSymbolsGridViewRounded as GridViewRounded } from "@assets/icons";

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

    const [activeKey, setActiveKey] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);

    const openModal = useCallback(() => setModalOpen(true), []);
    const closeModal = useCallback(() => setModalOpen(false), []);

    return (
        <>
            <Panel>
                <PanelBody title={LABELS.gridControls.gridTemplatePanel} initialOpen={true}>
                    <PanelToggle
                        value={activeKey}
                        onChange={setActiveKey}
                        label={null}
                        forceActive
                        panels={{
                            simple: GridAxisSimple,
                            tracks: GridAxisTracks,
                        }}
                        panelProps={{ clientId }}
                    >
                        <PanelToggle.TextOption value="simple" label={LABELS.gridControls.gridTemplatePanelSimple} />
                        <PanelToggle.TextOption value="tracks" label={LABELS.gridControls.gridTemplatePanelTracks} />
                    </PanelToggle>
                </PanelBody>
                <PanelBody title={LABELS.gridControls.gapPanel} initialOpen={true}>
                    <Flex direction="column" expanded={true}>
                        <FlexBlock>
                            <GapControls
                                attributes={attributes}
                                clientId={clientId}
                                updateBlockAttributes={updateBlockAttributes}
                                blockName={name}
                            />
                        </FlexBlock>
                    </Flex>
                </PanelBody>
                <PanelBody title={LABELS.gridControls.gridTemplateAreasPanel} initialOpen={true}>
                    <Flex direction="column" gap={4}>
                        <TokenGrid clientId={clientId} />
                        <Flex justify="flex-end">
                            <Button variant="secondary" onClick={openModal}>
                                {LABELS.gridControls.gridTemplateAreasEditLarge}
                            </Button>
                        </Flex>
                    </Flex>
                </PanelBody>
            </Panel>
            {isModalOpen && (
                <Modal
                    title={LABELS.gridControls.gridTemplateAreasModal}
                    onRequestClose={closeModal}
                    className="costered-blocks-modal--wide"
                    shouldCloseOnClickOutside={true}
                >
                    <TokenGrid clientId={clientId} />
                </Modal>
            )}
        </>
    );
};

const isGrid = (attributes = {}) => {
    const value = attributes?.display ?? attributes?.style?.display ?? '';
    return /^(grid|inline-grid)$/.test(value);
};

export default {
    name: 'grid-controls',
    title: LABELS.gridControls.panelTitle,
    icon: <GridViewRounded />,
    isVisible: ({ attributes }) => isGrid(attributes),
    render: () => <GridControls />,
};