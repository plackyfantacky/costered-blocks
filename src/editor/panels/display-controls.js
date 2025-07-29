import { registerLayoutPanel } from '@registry';
import { useSelectedBlockInfo, useUnsetBlockAttributes } from "@lib/hooks";

import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';

import {

    BaseControl,
    Flex,
    FlexItem,
    SelectControl,
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
} from "@wordpress/components";

const DisplayPanel = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const { updateBlockAttributes } = useDispatch('core/block-editor');

    if (!selectedBlock) return null;

    const { attributes } = selectedBlock;
    const unsetAttrs = useUnsetBlockAttributes(clientId);

    return (
        <ToolsPanel label={__('Display', 'costered-blocks')} resetAll={() => { }}>
            <ToolsPanelItem
                label={__('Display', 'costered-blocks')}
                hasValue={() => !!(attributes.display)}
                onDeselect={() => unsetAttrs(['display'])}
                isShownByDefault={true}
            >

                <Flex direction="column" gap={2}>
                    <FlexItem>

                        <BaseControl label={__('Display Type', 'costered-blocks')}>
                            <SelectControl
                                value={attributes.display || 'block'}
                                options={[
                                    { label: __('Block', 'costered-blocks'), value: 'block' },
                                    { label: __('Inline', 'costered-blocks'), value: 'inline' },
                                    { label: __('Inline Block', 'costered-blocks'), value: 'inline-block' },
                                    { label: __('Flex', 'costered-blocks'), value: 'flex' },
                                    { label: __('Grid', 'costered-blocks'), value: 'grid' },
                                    { label: __('None', 'costered-blocks'), value: 'none' },
                                ]}
                                onChange={(value) => updateBlockAttributes(clientId, { display: value })}
                            />
                        </BaseControl>
                    </FlexItem>
                    <FlexItem>
                        <BaseControl label={__('Visibility', 'costered-blocks')}>
                            <SelectControl
                                value={attributes.visibility || 'visible'}
                                options={[
                                    { label: __('Visible', 'costered-blocks'), value: 'visible' },
                                    { label: __('Hidden', 'costered-blocks'), value: 'hidden' },
                                    { label: __('Collapse', 'costered-blocks'), value: 'collapse' },
                                ]}
                                onChange={(value) => updateBlockAttributes(clientId, { visibility: value })}
                            />
                        </BaseControl>
                    </FlexItem>
                    <FlexItem>
                        <BaseControl label={__('Overflow', 'costered-blocks')}>
                            <SelectControl
                                value={attributes.overflow || 'visible'}
                                options={[
                                    { label: __('Visible', 'costered-blocks'), value: 'visible' },
                                    { label: __('Hidden', 'costered-blocks'), value: 'hidden' },
                                    { label: __('Clip', 'costered-blocks'), value: 'clip' },
                                    { label: __('Scroll', 'costered-blocks'), value: 'scroll' },
                                    { label: __('Scroll X', 'costered-blocks'), value: 'scroll-x' },
                                    { label: __('Scroll Y', 'costered-blocks'), value: 'scroll-y' },
                                    { label: __('Auto', 'costered-blocks'), value: 'auto' }
                                ]}
                                onChange={(value) => updateBlockAttributes(clientId, { overflow: value })}
                            />
                        </BaseControl>
                    </FlexItem>
                </Flex>

            </ToolsPanelItem>
        </ToolsPanel>
    );
};

registerLayoutPanel(() => <DisplayPanel />);