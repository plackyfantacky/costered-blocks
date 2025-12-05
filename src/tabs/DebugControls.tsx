import { Panel, PanelBody, Button, Flex, FlexItem, Modal } from '@wordpress/components';
import { useMemo, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

import CustomNotice from "@components/CustomNotice";
import { LABELS } from '@labels';
import { useSelectedBlockInfo } from '@hooks';
import Icon from '@components/Icon';

declare global {
    interface Window {
        CB_WP_DEBUG?: boolean;
    }
}

const icon = <Icon icon="buddicons-replies" size={24} />;

function DebugControlsBody() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasCopied, setHasCopied] = useState(false);

    const { selectedBlock} = useSelectedBlockInfo();

    const debugInfo = useMemo(() => {
        if (!selectedBlock) {
            return LABELS.debugTab.noBlockSelected;
        }
        return JSON.stringify(selectedBlock, null, 2);
    }, [selectedBlock]);

    const handleCopyToClipboard = () => {
        if(!debugInfo) return;

        setHasCopied(false);

        if(navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
                .writeText(debugInfo)
                .then(() => {
                    setHasCopied(true);
                })
                .catch(() => {
                    setHasCopied(false);
                });
            return;
        }

    }

    return (
        <Panel className="costered-blocks--tab--debug-controls">
            <PanelBody>
                {!selectedBlock && (
                    <CustomNotice
                        type="warning"
                        title={LABELS.debugTab.noBlockSelected}
                    />
                )}
                {selectedBlock && (
                    <>
                        <h3>{LABELS.debugTab.title}</h3>
                        <pre className="costered-blocks--debug--pre">
                            {debugInfo}
                        </pre>
                        <Flex justify="space-between" align="center" className="costered-blocks--debug--actions">
                            <FlexItem>
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    {LABELS.debugTab.viewInModal}
                                </Button>
                            </FlexItem>
                            <FlexItem>
                                <Button
                                    variant="primary"
                                    onClick={handleCopyToClipboard}
                                >
                                    {hasCopied ? LABELS.debugTab.copiedToClipboard : LABELS.debugTab.copyToClipboard}
                                </Button>
                            </FlexItem>
                        </Flex>
                        {isModalOpen && (
                            <Modal
                                title={LABELS.debugTab.modalTitle}
                                onRequestClose={() => setIsModalOpen(false)}
                                className="costered-blocks--debug--modal"
                            >
                                <Flex direction="column" justify="space-between" align="center" className="costered-blocks--debug--modal--layout">
                                    <pre className="costered-blocks--debug--pre costered-blocks--debug--modal--pre">
                                        {debugInfo}
                                    </pre>
                                    <Flex justify="flex-end" align="center" gap={2} className="costered-blocks--debug--modal--actions">
                                        <Button
                                            variant="secondary"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            {LABELS.debugTab.closeModal}
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={handleCopyToClipboard}
                                        >
                                            {hasCopied ? LABELS.debugTab.copiedToClipboard : LABELS.debugTab.copyToClipboard}
                                        </Button>
                                    </Flex>
                                </Flex>
                            </Modal>
                        )}      
                    </>
                )}
            </PanelBody>
        </Panel>
    );
}

export default {
    name: 'debug-controls',
    title: 'Debug Information',
    icon: icon,
    render: DebugControlsBody,
    isVisible: () => {
        return Boolean(window.CB_WP_DEBUG);
    },
}