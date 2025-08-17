import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexBlock } from '@wordpress/components';

import { FlexChildItem } from '@components/Icons';
import NumberControlInput from '@components/NumberControlInput';
import UnitControlInput from '@components/UnitControlInput';

import { useSelectedBlockInfo, useSetOrUnsetAttrs } from "@lib/hooks";

const FlexGrowControl = ({ attributes, clientId, updateAttributes }) => {
    return (
        <NumberControlInput
            label={__('Flex Grow', 'costered-blocks')}
            value={attributes?.flexGrow || 0}
            onChange={useSetOrUnsetAttrs('flexGrow', attributes, updateAttributes, clientId)}
            step={0.1}
            min={0}
            max={10}
        />
    );
};

const FlexShrinkControl = ({ attributes, clientId, updateAttributes }) => {
    return (
        <NumberControlInput
            label={__('Flex Shrink', 'costered-blocks')}
            value={attributes?.flexShrink || 0}
            onChange={useSetOrUnsetAttrs('flexShrink', attributes, updateAttributes, clientId)}
            step={0.1}
            min={0}
            max={10}
        />
    );
};

const FlexBasisControl = ({ attributes, clientId, updateAttributes }) => {
    return (
        <UnitControlInput
            label={__('Flex Basis', 'costered-blocks')}
            value={attributes?.flexBasis || ''}
            onChange={useSetOrUnsetAttrs('flexBasis', attributes, updateAttributes, clientId)}
            units={['px', '%', 'em', 'rem', 'vw', 'vh', 'auto']}
            placeholder={__('Enter value', 'costered-blocks')}
        />
    );
};

const FlexOrderControl = ({ attributes, clientId, updateAttributes }) => {
    
    //set max and min to maxInteger values for order because who knows how many items there will be? someone will try to set it to a very high number.
    const maxInteger = Number.MAX_SAFE_INTEGER;
    const minInteger = -maxInteger;


    return (
        <NumberControlInput
            label={__('Flex Order', 'costered-blocks')}
            value={attributes?.order || 0}
            onChange={useSetOrUnsetAttrs('order', attributes, updateAttributes, clientId)}
            step={1}
            min={minInteger}
            max={maxInteger}
        />
    );
}

const FlexItemControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');

    if (!selectedBlock) return null;
    
    const { attributes } = selectedBlock;

    return (
        <Panel className="costered-blocks-flex-item-controls">
            <PanelBody title={__('Flex Item Controls', 'costered-blocks')}>
                <Flex expanded={true} direction="column">
                    <FlexBlock>
                        <FlexGrowControl
                            attributes={attributes}
                            clientId={clientId}
                            updateAttributes={updateBlockAttributes}
                        />
                    </FlexBlock>
                    <FlexBlock>
                        <FlexShrinkControl
                            attributes={attributes}
                            clientId={clientId}
                            updateAttributes={updateBlockAttributes}
                        />
                    </FlexBlock>
                    <FlexBlock>
                        <FlexBasisControl
                            attributes={attributes}
                            clientId={clientId}
                            updateAttributes={updateBlockAttributes}
                        />
                    </FlexBlock>
                    <FlexBlock>
                        <FlexOrderControl
                            attributes={attributes}
                            clientId={clientId}
                            updateAttributes={updateBlockAttributes}
                        />
                    </FlexBlock>
                </Flex>
            </PanelBody>
        </Panel>
    );
};

export default {
    name: 'flex-item-controls',
    title: __('Flex Item Controls', 'costered-blocks'),
    icon: <FlexChildItem />,
    isVisible: ({parentAttrs} = {}) => ['flex', 'inline-flex'].includes(parentAttrs?.display),
    render: () => <FlexItemControls />,
};