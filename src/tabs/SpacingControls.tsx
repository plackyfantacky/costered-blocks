import { Panel, PanelBody, Flex, FlexItem, BaseControl } from '@wordpress/components';

import { LABELS } from "@labels";
import DirectionalInputGroup from "@components/composite/DirectionalInputGroup";
import { useSelectedBlockInfo } from "@hooks";
import { TablerBoxMargin as BoxMargin } from "@assets/icons";


const SpacingControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    if (!selectedBlock || !clientId) return null; // do not remove. prevents error when switching to code editor mode
    const { name } = selectedBlock;

    return (
        <Panel className="costered-blocks--tab--spacing-controls">
            <PanelBody title={LABELS.spacingControls.panelTitle} className="costered-blocks--spacing-controls--inner" initialOpen={true}>
                <Flex direction="column" gap={4}>
                    <FlexItem className="costered-blocks--spacing-controls--margin">
                        <BaseControl label={LABELS.spacingControls.marginLabel} __nextHasNoMarginBottom>
                            <DirectionalInputGroup
                                prefix="margin"
                                clientId={clientId}
                                blockName={name}
                            />
                        </BaseControl>
                    </FlexItem>
                    <FlexItem className="costered-blocks--spacing-controls--padding">
                        <BaseControl label={LABELS.spacingControls.paddingLabel} __nextHasNoMarginBottom>
                            <DirectionalInputGroup
                                prefix="padding"
                                clientId={clientId}
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
