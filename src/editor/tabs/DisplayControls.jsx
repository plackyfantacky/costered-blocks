import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexItem } from '@wordpress/components';

import { useSelectedBlockInfo, useSetOrUnsetAttrs } from "@lib/hooks";


import { CustomSelectControl as SelectControl } from "@components/CustomSelectControl";
import {
    BoxIcon,
    BrickOulineRounded,
    MatchWordRounded,
    FlexNoWrapRounded,
    GridViewRounded,
    BorderNoneVariant,
    EyeOutline,
    EyeOffOutline,
    Collapse 
} from "@components/Icons";

const DisplaySelectControl = ({ attributes, clientId, updateAttributes }) => {
    return (
        <SelectControl
            label={__('Display', 'costered-blocks')}
            value={attributes?.display || ""}
            onChange={useSetOrUnsetAttrs('display', attributes, updateAttributes, clientId) }
        >
            <SelectControl.Option value="block"><BrickOulineRounded />{__('Block', 'costered-blocks')}</SelectControl.Option>
            <SelectControl.Option value="inline"><MatchWordRounded />{__('Inline', 'costered-blocks')}</SelectControl.Option>
            <SelectControl.Option value="flex"><FlexNoWrapRounded />{__('Flex', 'costered-blocks')}</SelectControl.Option>
            <SelectControl.Option value="grid"><GridViewRounded />{__('Grid', 'costered-blocks')}</SelectControl.Option>
            <SelectControl.Option value="none"><BorderNoneVariant />{__('None', 'costered-blocks')}</SelectControl.Option>
        </SelectControl>
    );
};

const VisibilitySelectControl = ({ attributes, clientId, updateAttributes }) => {
    return (
        <SelectControl
            label={__('Visibility', 'costered-blocks')}
            value={attributes?.visibility || ''}
            onChange={useSetOrUnsetAttrs('visibility', attributes, updateAttributes, clientId) }    
        >
            <SelectControl.Option value="visible"><EyeOutline />{__('Visible', 'costered-blocks')}</SelectControl.Option>
            <SelectControl.Option value="hidden"><EyeOffOutline />{__('Hidden', 'costered-blocks')}</SelectControl.Option>
            <SelectControl.Option value="collapse"><Collapse />{__('Collapse', 'costered-blocks')}</SelectControl.Option>
        </SelectControl>
    );
};

const DisplayControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');

    if (!selectedBlock) return null;

    const { attributes } = selectedBlock;

    return (
        <Panel>
            <PanelBody title={__('Display', 'costered-blocks')} initialOpen={true} style={{ gap: '10rem' }}>
                <Flex direction="column" gap={4} style={{ marginBottom: '1rem' }}>
                    <FlexItem>
                        <DisplaySelectControl
                            attributes={attributes}
                            clientId={clientId}
                            updateAttributes={updateBlockAttributes}
                        />
                    </FlexItem>
                    <FlexItem>
                        <VisibilitySelectControl
                            attributes={attributes}
                            clientId={clientId}
                            updateAttributes={updateBlockAttributes}
                        />
                    </FlexItem>
                </Flex>
            </PanelBody>
        </Panel>
    );
};

export default {
    name: "display-controls",
    title: __('Display Controls', 'costered-blocks'),
    icon: <BoxIcon />,
    render: () => <DisplayControls />
};
