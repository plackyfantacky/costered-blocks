import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexItem } from '@wordpress/components';

import DisplayInputControl from "@components/DisplayInputControl";
import VisibilityInputControl from "../../components/VisibilityInputControl";
import { useSelectedBlockInfo, useUnsetBlockAttributes } from "@lib/hooks";

const DisplayControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');

    if (!selectedBlock) return null;

    const { attributes } = selectedBlock;
    const unsetAttrs = useUnsetBlockAttributes(clientId);

    return (
        <Panel>
            <PanelBody title={__('Display', 'costered-blocks')} initialOpen={true} style={{ gap: '10rem' }}>
                <Flex direction="column" gap={4} style={{ marginBottom: '1rem' }}>
                    <FlexItem>
                        <DisplayInputControl
                            attributes={attributes}
                            clientId={clientId}
                            updateAttributes={updateBlockAttributes}
                            unsetAttrs={() => unsetAttrs(['display'])}
                        />
                    </FlexItem>
                    <FlexItem>
                        <VisibilityInputControl
                            attributes={attributes}
                            clientId={clientId}
                            updateAttributes={updateBlockAttributes}
                            unsetAttrs={() => unsetAttrs(['visibility'])}
                        />
                    </FlexItem>
                </Flex>
            </PanelBody>
        </Panel>
    );
};

// lucide:box (Lucide / license: ISC)
const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
            <path d="m3.3 7l8.7 5l8.7-5M12 22V12"></path>
        </g>
    </svg>
);

export default {
    name: "display-controls",
    title: __('Display Controls', 'costered-blocks'),
    icon,
    content: <DisplayControls />
};
