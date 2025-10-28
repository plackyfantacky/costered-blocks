import { sprintf } from '@wordpress/i18n';
import { PanelBody, PanelRow, Flex, FlexBlock, ToggleControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useCallback } from "@wordpress/element";

import { LABELS } from '@labels';
import { useAttrGetter, useAttrSetter, useParentAttrs, useUIPreferences, useScopedKey  } from '@hooks';
import { selectActiveBreakpoint } from '@stores/activeBreakpoint';
import type { Breakpoint, GridAxisDisabled } from '@types'
import { use } from "react";

type Props = {
    clientId: string;
    blockName: string;
    onAxisDisableChange?: (disabled: GridAxisDisabled) => void;
};

export default function SubGridToggle({
    clientId,
    blockName,
    onAxisDisableChange
}: Props) {

    const { parentAugmented } = useParentAttrs(clientId);
    const activeBreakpoint = useSelect(selectActiveBreakpoint, []) as Breakpoint | undefined;

    const { get } = useAttrGetter(clientId);
    const { set, unset } = useAttrSetter(clientId);

    const parentDisplay =
        typeof parentAugmented?.$get === 'function'
            ? parentAugmented.$get('display', { cascade: true })
            : undefined;

    const parentIsGrid = typeof parentDisplay === 'string' && /grid/.test(parentDisplay);
    if (!parentIsGrid) return null;

    const subgridKey = useScopedKey('subgridPanelOpen', { blockName: blockName });
    const [subgridPanelOpen, setSubgridPanelOpen] = useUIPreferences(subgridKey, false);

    const subCols = get('gridTemplateColumns', { raw: true }) === 'subgrid';
    const subRows = get('gridTemplateRows', { raw: true }) === 'subgrid';

    const enableDisplayGridIfNeeded = useCallback(() => {
        const currentDisplay = get('display', { raw: true });
        if (currentDisplay !== 'grid') set('display', 'grid');
    }, [get, set]);

    const onToggleCols = useCallback(
        (next: boolean) => {
            if (next) {
                enableDisplayGridIfNeeded();
                set('gridTemplateColumns', 'subgrid');
            } else {
                unset('gridTemplateColumns');
            }
            onAxisDisableChange?.({ columns: next, rows: subRows });
        },
        [enableDisplayGridIfNeeded, set, unset, onAxisDisableChange, subRows]
    );

    const onToggleRows = useCallback(
        (next: boolean) => {
            if (next) {
                enableDisplayGridIfNeeded();
                set('gridTemplateRows', 'subgrid');
            } else {
                unset('gridTemplateRows');
            }
            onAxisDisableChange?.({ columns: subCols, rows: next });
        },
        [enableDisplayGridIfNeeded, set, unset, onAxisDisableChange, subCols]
    );
    
    return (
        <PanelBody 
            title={LABELS.gridControls.subgridPanel.title} 
            initialOpen={subgridPanelOpen} 
            onToggle={setSubgridPanelOpen} 
            className="costered-blocks--grid-controls--subgrid"
        >
            <PanelRow className="costered-blocks--grid-controls--subgrid-toggle">
                <Flex direction="column" gap={4}>
                    <FlexBlock>
                        <ToggleControl
                            label={sprintf(LABELS.gridControls.subgridPanel.columns.label, activeBreakpoint ?? 'desktop')}
                            help={LABELS.gridControls.subgridPanel.columns.help}
                            checked={!!subCols}
                            onChange={onToggleCols}
                            __nextHasNoMarginBottom
                            __next40pxDefaultSize       
                        />
                    </FlexBlock>
                    <FlexBlock>
                        <ToggleControl
                            label={sprintf(LABELS.gridControls.subgridPanel.rows.label, activeBreakpoint ?? 'desktop')}
                            help={LABELS.gridControls.subgridPanel.rows.help}
                            checked={!!subRows}
                            onChange={onToggleRows}
                            __nextHasNoMarginBottom
                            __next40pxDefaultSize
                        />
                    </FlexBlock>
                </Flex>
            </PanelRow>
        </PanelBody>
    );
}
