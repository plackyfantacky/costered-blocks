import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexItem, BaseControl } from '@wordpress/components';

import DirectionalInputGroup from "@components/DirectionalInputGroup";
import { useSelectedBlockInfo, useUnsetBlockAttributes } from "@lib/hooks";

const SpacingControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');

    if (!selectedBlock) return null;

    const { attributes } = selectedBlock;

    return (
        <Panel>
            <PanelBody title={__('Spacing', 'costered-blocks')} initialOpen={true}>
                <Flex direction="column" gap={4} style={{ marginBottom: '1rem' }}>
                    <FlexItem>
                        <BaseControl label={__('Margin', 'costered-blocks')}>
                            <DirectionalInputGroup
                                prefix="margin"
                                attributes={attributes}
                                clientId={clientId}
                                updateAttributes={updateBlockAttributes}
                            />
                        </BaseControl>
                    </FlexItem>
                    <FlexItem>
                        <BaseControl label={__('Padding', 'costered-blocks')}>
                            <DirectionalInputGroup
                                prefix="padding"
                                attributes={attributes}
                                clientId={clientId}
                                updateAttributes={updateBlockAttributes}
                            />
                        </BaseControl>
                    </FlexItem>
                </Flex>
            </PanelBody>
        </Panel>
    );
};

// tabler:box-margin (Tabler Icons / license: MIT)
const icon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 8h8v8H8zM4 4v.01M8 4v.01M12 4v.01M16 4v.01M20 4v.01M4 20v.01M8 20v.01m4-.01v.01m4-.01v.01m4-.01v.01M20 16v.01M20 12v.01M20 8v.01M4 16v.01M4 12v.01M4 8v.01"></path>
    </svg>
);

export default {
    name: "spacing-controls",
    title: __('Spacing Controls', 'costered-blocks'),
    icon,
    content: <SpacingControls />
};
