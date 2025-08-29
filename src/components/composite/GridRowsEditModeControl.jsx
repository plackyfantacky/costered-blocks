import { __ } from '@wordpress/i18n';
import {
    Flex, FlexBlock, FlexItem, Button, Popover,
    __experimentalHeading as Heading,
    __experimentalText as Text
} from '@wordpress/components';
import { useRef, useState } from '@wordpress/element';

import { useUIPreferences, scopedKey, useSafeBlockName } from "@hooks";
import { CustomSelectControl as SelectControl } from "@components/CustomSelectControl";

import {
    MaterialSymbolsHelpOutlineRounded as HelpIcon
} from "@assets/icons";

export default function GridRowsEditModeControl({ clientId, name }) {

    const safeBlockName = useSafeBlockName(name, clientId);
    const unitModePrefKey = scopedKey('gridTemplateRowsMode', { blockName: safeBlockName });
    const [templateRowMode, setTemplateRowMode] = useUIPreferences(unitModePrefKey, 'unit');

    const [popoverOpen, setPopoverOpen] = useState(false);
    const togglePopover = () => setPopoverOpen((prevOpen) => !prevOpen);
    const closePopover = () => setPopoverOpen(false);
    const popoverRef = useRef();

    const printPopoverMessage = (mode) => {
        switch (mode) {
            case 'simple': {
                return (
                    <>
                        <Heading level={5}>{__('Simple', 'costered-blocks')}</Heading>
                        <Text>{__(`In Simple mode, you can define the number of rows. All rows equally divide the total available width.`, 'costered-blocks')}</Text>
                    </>
                );
            }
            case 'custom': {
                return (
                    <>
                        <Heading level={5}>{__('Custom', 'costered-blocks')}</Heading>
                        <Text>{__(`In Custom mode, you can define the exact width of each row using CSS grid syntax.`, 'costered-blocks')}</Text>
                    </>
                );
            }
        }
    };

    return (
        <div className="costered-blocks--grid-template-rows-mode-toggle">
            <Flex direction="row" expanded={true} gap={2} align="flex-end">
                <FlexBlock>
                    <SelectControl
                        label={__('Editing Mode', 'costered-blocks')}
                        value={templateRowMode}
                        onChange={(value) => setTemplateRowMode(value)}
                    >
                        <SelectControl.Option value="simple">{__('Simple', 'costered-blocks')}</SelectControl.Option>
                        <SelectControl.Option value="custom">{__('Custom', 'costered-blocks')}</SelectControl.Option>
                    </SelectControl>
                </FlexBlock>
                {templateRowMode != "" && (
                    <FlexItem>
                        <Button
                            ref={popoverRef}
                            icon={<HelpIcon />}
                            onClick={togglePopover}
                            aria-expanded={popoverOpen}
                            label={__('Help', 'costered-blocks')}
                        >
                            {popoverOpen && (
                                <Popover
                                    anchor={popoverRef.current}
                                    noArrow={false}
                                    offset={12}
                                    placement="bottom-end"
                                    onClose={closePopover}
                                    onFocusOutside={() => { }}
                                    className="costered-blocks-grid-help-popover"
                                >
                                    <div style={{ width: 248, maxWidth: '100%', padding: '1rem' }}>
                                        {printPopoverMessage(templateRowMode)}
                                    </div>
                                </Popover>
                            )}
                        </Button>
                    </FlexItem>
                )}
            </Flex>
        </div>
    );
};