import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { Panel, PanelBody, TabPanel, Flex, FlexItem, Notice } from '@wordpress/components';
import { getBlockType } from '@wordpress/blocks';
import { isValidElement, cloneElement } from 'react';

import { useSelectedBlockInfo } from "@lib/hooks";
import { BLOCKS_WITH_EDITOR_STYLES } from "../lib/schema";

import DimensionsControls from "@tabs/DimensionsControls";
import DisplayControls from "@tabs/DisplayControls";
import SpacingControls from "@tabs/SpacingControls";

const tabs = [
    DisplayControls,
    DimensionsControls,
    SpacingControls,
];

const Icon = ({ name, size = 24, style = {} }) => {

    const DefaultIcon = (
        <>
            { /* Default icon if no name is provided. Icon from iconify.design: mdi--question-box-multiple (Material Design Icons | License: Apache 2.0) */}
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24">
                <path fill="currentColor" d="M16 20v2H4c-1.1 0-2-.9-2-2V7h2v13zm4-18H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m-5 12h-2v-2h2zm1.8-5.2c-.3.4-.7.7-1.1.9c-.2.2-.4.3-.5.5c-.2.2-.2.5-.2.8h-2q0-.75.3-1.2c.2-.3.5-.6 1-.9q.45-.3.6-.6c.2-.2.2-.5.2-.8s-.1-.6-.3-.8s-.4-.3-.8-.3c-.3 0-.5.1-.7.2c-.2.2-.3.4-.3.7h-1.9c0-.8.2-1.4.8-1.8c.7-.3 1.4-.5 2.3-.5s1.7.2 2.2.7s.8 1.1.8 1.8c0 .5-.2.9-.4 1.3"></path>
            </svg>
        </>
    );

    if (!name) return <DefaultIcon />;

    const blockType = getBlockType(name);
    if (!blockType || !blockType.icon) return null;
    const icon = blockType.icon;

    // If the icon is a dashicons icon, render it as a span with the appropriate class
    if (typeof icon === 'string') {
        return <span className={`block-editor-block-icon dashicons dashicons-${icon}`} style={style} />;
    }

    //rare case where core block icon is an object
    if (typeof icon === 'object' && icon !== null && icon.src) {
        const { src, foreground, background } = icon;

        const Wrapper = ({ children }) => (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: size,
                height: size,
                backgroundColor: background || 'transparent',
                color: foreground || 'inherit',
                ...style,
            }}>
                {children}
            </span>
        );

        if (isValidElement(src)) {
            return (
                <Wrapper>
                    {cloneElement(src, { width: size, height: size, style: { ...src.props.style, ...style } })}
                </Wrapper>
            );
        } else if (typeof src === 'function') {
            const IconComponent = src;
            return (
                <Wrapper>
                    <IconComponent width={size} height={size} style={{ ...style, width: size, height: size }} />
                </Wrapper>
            );
        }
    }

    // If icon is a valid React element (SVG etc), clone it with new size/style
    if (isValidElement(icon)) {
        return cloneElement(icon, {
            width: size,
            height: size,
            style: { ...icon.props.style, ...style }
        });
    }

    // Fallback
    return <DefaultIcon />;
};

const Sidebar = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();

    if (!selectedBlock) {
        return <PluginSidebar name="costered-blocks-sidebar" title={__('Costered Blocks', 'costered-blocks')}>
            <Panel>
                <PanelBody>
                    <p>{__('Please select a block to edit its settings.', 'costered-blocks')}</p>
                </PanelBody>
            </Panel>
        </PluginSidebar>;
    }

    return (
        <PluginSidebar name="costered-blocks-sidebar" title={__('Costered Blocks', 'costered-blocks')} className="costered-blocks-sidebar">
            <Panel className="costered-blocks-sidebar">
                <PanelBody>
                    <Flex justify="space-between" align="center">
                        <FlexItem>
                            {__('Selected block:', 'costered-blocks')}
                        </FlexItem>
                        <FlexItem>
                            <Flex align="center" gap={0.5}>
                                <Icon name={selectedBlock.name} size={24} />
                                <strong>{selectedBlock.name}</strong>
                            </Flex>
                        </FlexItem>
                    </Flex>
                    {BLOCKS_WITH_EDITOR_STYLES.includes(selectedBlock.name) && (
                        <div style={{ marginTop: '1em' }}>
                            <Notice status="warning" isDismissible={false}>
                                <details key={".0"}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 500 }}>{__('Style changes may not appear in the editor', 'costered-blocks')}</summary>
                                    <Flex direction="column" gap={2} style={{ marginTop: '1em' }}>
                                        {__("Changing the style properties of this block may not appear to have much effect in the editor. This is due to limitations in the block editor, which does not always allow custom inline styles to be displayed here.", 'costered-blocks')}
                                        <strong>{__('Your styles will still appear correctly on the frontend of your site.', 'costered-blocks')}</strong>
                                    </Flex>
                                </details>
                            </Notice>
                        </div>
                    )}
                </PanelBody>
            </Panel>
            <TabPanel
                className="costered-blocks-sidebar-tabs"
                tabs={tabs.map(({ name, title, icon }) => ({ name, title, icon }))}
            >
                {(tab) => {
                    const tabDef = tabs.find(t => t.name === tab.name);
                    return tabDef?.content ? tabDef.content : null;
                }}
            </TabPanel>
        </PluginSidebar>
    );
};

registerPlugin('costered-blocks-sidebar', {
    render: Sidebar,
});