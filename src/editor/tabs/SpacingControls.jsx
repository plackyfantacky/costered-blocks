import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexItem, BaseControl } from '@wordpress/components';

import { LABELS } from "@labels";
import DirectionalInputGroup from "@components/composite/DirectionalInputGroup";
import { useSelectedBlockInfo } from "@hooks";

import { TablerBoxMargin as BoxMargin } from "@assets/icons";

const SpacingControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');

    if (!selectedBlock) return null;

    const { attributes, name } = selectedBlock;

    return (
        <Panel>
            <PanelBody title={LABELS.spacingControls.panelTitle} initialOpen={true}>
                <Flex direction="column" gap={4}>
                    <FlexItem>
                        <BaseControl label={LABELS.spacingControls.marginLabel} __nextHasNoMarginBottom>
                            <DirectionalInputGroup
                                prefix="margin"
                                attributes={attributes}
                                clientId={clientId}
                                updateBlockAttributes={updateBlockAttributes}
                                blockName={name}
                            />
                        </BaseControl>
                    </FlexItem>
                    <FlexItem>
                        <BaseControl label={LABELS.spacingControls.paddingLabel} __nextHasNoMarginBottom>
                            <DirectionalInputGroup
                                prefix="padding"
                                attributes={attributes}
                                clientId={clientId}
                                updateBlockAttributes={updateBlockAttributes}
                                blockName={name}
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
    title: LABELS.spacingControls.panelTitle,
    icon: <BoxMargin />,
    render: () => <SpacingControls />
};
