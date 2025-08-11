import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody } from '@wordpress/components';

import { useSelectedBlockInfo, useUnsetBlockAttributes } from "@lib/hooks";

import CustomSelectControl from "@components/CustomSelectControl";
import {
    FlexNoWrapRounded,
    ArrowUpThin,
    ArrowDownThin,
    ArrowLeftThin,
    ArrowRightThin } from "@components/Icons";

const DirectionSelectControl = ({ attributes, clientId, updateAttributes }) => {
    const handleChange = (value) => {
        if (!value) {
            updateAttributes(clientId, {
                ...attributes,
                flexDirection: undefined
            });
        } else {
            updateAttributes(clientId, {
                ...attributes,
                flexDirection: value
            });
        }
    };
    const directionOptions = [
        { value: 'row', content: __('Row', 'costered-blocks'), icon: <ArrowRightThin />, altIcon: <ArrowLeftThin /> },
        { value: 'row-reverse', content: __('Row Reverse', 'costered-blocks'), icon: <ArrowLeftThin />, altIcon: <ArrowRightThin /> },
        { value: 'column', content: __('Column', 'costered-blocks'), icon: <ArrowDownThin /> },
        { value: 'column-reverse', content: __('Column Reverse', 'costered-blocks'), icon: <ArrowUpThin /> },
    ];

    return (
        <CustomSelectControl
            label={__('Flex Direction', 'costered-blocks')}
            value={typeof attributes?.flexDirection === "string" ? attributes.flexDirection : ""}
            onChange={handleChange}
            options={directionOptions}
        />
    );
};









const FlexBoxControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');

    if (!selectedBlock) return null;

    const { attributes } = selectedBlock;
    const unsetAttrs = useUnsetBlockAttributes(clientId);

    return (
        <Panel>
            <PanelBody title={__('Flexbox Controls', 'costered-blocks')} initialOpen={true}>
                <div className="flexbox-controls">
                    <DirectionSelectControl
                        attributes={attributes}
                        clientId={clientId}
                        updateAttributes={updateBlockAttributes}
                        unsetAttrs={() => unsetAttrs(['flexDirection'])}
                    />
                    {/* Add your Flexbox controls here */}
                </div>
            </PanelBody>
        </Panel>
    );
};

const isFlex = (attributes = {}) => {
    const value = attributes?.display ?? attributes?.style?.display ?? '';
    return /^(flex|inline-flex)$/.test(value);
};

export default {
    name: 'flexbox-controls',
    title: __('Flexbox Controls', 'costered-blocks'),
    icon: <FlexNoWrapRounded />,
    isVisible: ({ attributes }) => isFlex(attributes),
    render: () => <FlexBoxControls />,
};