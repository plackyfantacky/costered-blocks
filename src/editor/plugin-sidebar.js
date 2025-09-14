import { registerPlugin } from '@wordpress/plugins';
import { PluginSidebar } from '@wordpress/editor';
import { getBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { isValidElement, cloneElement } from '@wordpress/element';
import { Panel, PanelBody, Flex, FlexItem, Notice } from '@wordpress/components';


import { LABELS } from '@labels';
import { useSelectedBlockInfo } from "@hooks";
import { BLOCKS_WITH_EDITOR_STYLES } from "@config";
import SidebarTabs from "@tabs/SidebarTabs";

import {
    MdiQuestionBoxMultiple as UnknownIcon,
    GameIconsHammerBreak as HammerBreakIcon
} from "@assets/icons";

const TabIcon = ({ name, size = 24, style = {} }) => {

    if (!name) return <UnknownIcon />;

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
    return <UnknownIcon />;
};

const Sidebar = () => {
    const { selectedBlock } = useSelectedBlockInfo();

    if (!selectedBlock) {
        return <PluginSidebar name="costered-blocks-sidebar" title={LABELS.pluginSidebar.title} className="costered-blocks-sidebar">
            <Panel>
                <PanelBody>
                    <p>{LABELS.pluginSidebar.noBlockSelected}</p>
                </PanelBody>
            </Panel>
        </PluginSidebar>;
    }

    return (
        <PluginSidebar name="costered-blocks-sidebar" title={LABELS.pluginSidebar.title} className="costered-blocks-sidebar">
            <Panel className="costered-blocks-sidebar">
                <PanelBody>
                    <Flex justify="space-between" align="center">
                        <FlexItem>
                            {LABELS.pluginSidebar.selectedBlock}:
                        </FlexItem>
                        <FlexItem>
                            <Flex align="center" gap={0.5}>
                                <TabIcon name={selectedBlock.name} size={24} />
                                <strong>{selectedBlock.name}</strong>
                            </Flex>
                        </FlexItem>
                    </Flex>
                    {BLOCKS_WITH_EDITOR_STYLES.includes(selectedBlock.name) && (
                        <div style={{ marginTop: '1em' }}>
                            <Notice status="warning" isDismissible={false}>
                                <details key={".0"}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 500 }}>{LABELS.pluginSidebar.blockWarningSummary}</summary>
                                    <Flex direction="column" gap={2} style={{ marginTop: '1em' }}>
                                        {LABELS.pluginSidebar.blockWarningDetails}
                                    </Flex>
                                </details>
                            </Notice>
                        </div>
                    )}
                </PanelBody>
            </Panel>
            <SidebarTabs />
        </PluginSidebar>
    );
};

registerPlugin('costered-blocks-sidebar', {
    render: Sidebar,
    icon: <HammerBreakIcon width={24} height={24} />,
});