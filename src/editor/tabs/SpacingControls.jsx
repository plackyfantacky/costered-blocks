import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexItem, BaseControl } from '@wordpress/components';

import DirectionalInputGroup from "@components/DirectionalInputGroup";
import { useSelectedBlockInfo } from "@lib/hooks";

import { BoxMarginIcon } from "@components/Icons";

const SpacingControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');

    if (!selectedBlock) return null;

    const { attributes } = selectedBlock;

    return (
        <Panel>
            <PanelBody title={__('Spacing', 'costered-blocks')} initialOpen={true}>
                <Flex direction="column" gap={4}>
                    <FlexItem>
                        <BaseControl label={__('Margin', 'costered-blocks')} __nextHasNoMarginBottom>
                            <DirectionalInputGroup
                                prefix="margin"
                                attributes={attributes}
                                clientId={clientId}
                                updateAttributes={updateBlockAttributes}
                            />
                        </BaseControl>
                    </FlexItem>
                    <FlexItem>
                        <BaseControl label={__('Padding', 'costered-blocks')} __nextHasNoMarginBottom>
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

export default {
    name: "spacing-controls",
    title: __('Spacing Controls', 'costered-blocks'),
    icon: <BoxMarginIcon />,
    render: () => <SpacingControls />
};
