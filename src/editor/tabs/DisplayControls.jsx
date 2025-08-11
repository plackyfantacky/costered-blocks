import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexItem } from '@wordpress/components';

import { useSelectedBlockInfo, useUnsetBlockAttributes } from "@lib/hooks";

import CustomSelectControl from "@components/CustomSelectControl";
import {
    BoxIcon,
    BrickOulineRounded,
    MatchWordRounded,
    FlexNoWrapRounded,
    GridViewRounded,
    BorderNoneVariant,
    EyeOutlineIcon,
    EyeOffOutlineIcon,
    CollapseIcon 
} from "@components/Icons";

const DisplaySelectControl = ({ attributes, clientId, updateAttributes }) => {
    const handleChange = (value) => {
        if (!value) {
            updateAttributes(clientId, {
                ...attributes,
                display: undefined
            });
        } else {
            updateAttributes(clientId, {
                ...attributes,
                display: value
            });
        }
    };
    const displayOptions = [
        { value: 'block', content: __('Block', 'costered-blocks'), icon: <BrickOulineRounded /> },
        { value: 'inline', content: __('Inline', 'costered-blocks'), icon: <MatchWordRounded /> },
        { value: 'flex', content: __('Flex', 'costered-blocks'), icon: <FlexNoWrapRounded /> },
        { value: 'grid', content: __('Grid', 'costered-blocks'), icon: <GridViewRounded /> },
        { value: 'none', content: __('None', 'costered-blocks'), icon: <BorderNoneVariant /> },
    ];

    return (
        <CustomSelectControl
            label={__('Display', 'costered-blocks')}
            value={typeof attributes?.display === "string" ? attributes.display : ""}
            onChange={handleChange}
            options={displayOptions}
        />
    );
};

const VisibilitySelectControl = ({ attributes, clientId, updateAttributes }) => {
    const handleChange = (value) => {
        if (!value) {
            updateAttributes(clientId, {
                ...attributes,
                visibility: undefined
            });
        } else {
            updateAttributes(clientId, {
                ...attributes,
                visibility: value
            });
        }
    };

    const visibilityOptions = [
        { value: 'visible', content: __('Visible', 'costered-blocks'), icon: <EyeOutlineIcon /> },
        { value: 'hidden', content: __('Hidden', 'costered-blocks'), icon: <EyeOffOutlineIcon /> },
        { value: 'collapse', content: __('Collapse', 'costered-blocks'), icon: <CollapseIcon /> },
    ];

    return (
        <CustomSelectControl
            label={__('Visibility', 'costered-blocks')}
            value={typeof attributes?.visibility === "string" ? attributes.visibility : ""}
            onChange={handleChange}
            options={visibilityOptions}
        />
    );
};

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
                        <DisplaySelectControl
                            attributes={attributes}
                            clientId={clientId}
                            updateAttributes={updateBlockAttributes}
                            unsetAttrs={() => unsetAttrs(['display'])}
                        />
                    </FlexItem>
                    <FlexItem>
                        <VisibilitySelectControl
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

export default {
    name: "display-controls",
    title: __('Display Controls', 'costered-blocks'),
    icon: <BoxIcon />,
    render: () => <DisplayControls />
};
