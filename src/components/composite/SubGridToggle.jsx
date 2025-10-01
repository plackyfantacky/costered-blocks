import { sprintf } from '@wordpress/i18n';
import { PanelBody, PanelRow, Flex, FlexBlock, ToggleControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';

import { LABELS } from '@labels';
import { useAttrGetter, useAttrSetter, useParentAttrs, useUIPreferences, useScopedKey  } from '@hooks';
import { selectActiveBreakpoint } from '@stores/activeBreakpoint.js';

export default function SubGridToggle({ clientId, blockName, onAxisDisableChange }) {

    const { parentAttrs } = useParentAttrs(clientId);
    const activeBreakpoint = useSelect(selectActiveBreakpoint, []);

    const { get } = useAttrGetter(clientId);
    const { set, unset } = useAttrSetter(clientId);

    const parentDisplay = typeof parentAttrs?.$get === 'function'
        ? parentAttrs.$get('display')
        : parentAttrs?.display;
    const parentIsGrid = typeof parentDisplay === 'string' && parentDisplay.includes('grid');

    if (!parentIsGrid) return null;

    const subgridKey = useScopedKey('subgridPanelOpen', { blockName: blockName });
    const [subgridPanelOpen, setSubgridPanelOpen] = useUIPreferences(subgridKey, false);

    const subCols = get('gridTemplateColumns', { raw: true }) === 'subgrid';
    const subRows = get('gridTemplateRows', { raw: true }) === 'subgrid';

    const enableDisplayGridIfNeeded = () => {
        const currentDisplay = get('display', { raw: true });
        if (currentDisplay !== 'grid') set('display', 'grid');
    };

    const onToggleCols = (next) => {
        if (next) {
            enableDisplayGridIfNeeded();
            set('gridTemplateColumns', 'subgrid');
        } else {
            unset('gridTemplateColumns');
        }
        onAxisDisableChange?.({ columns: next, rows: subRows });
    };

    const onToggleRows = (next) => {
        if (next) {
            enableDisplayGridIfNeeded();
            set('gridTemplateRows', 'subgrid');
        } else {
            unset('gridTemplateRows');
        }
        onAxisDisableChange?.({ columns: subCols, rows: next });
    };   

    return (
        <PanelBody title={LABELS.gridControls.subgridPanel.title} initialOpen={subgridPanelOpen} onToggle={setSubgridPanelOpen} className="costered-blocks--grid-controls--subgrid">
            <PanelRow className="costered-blocks--grid-controls--subgrid-toggle">
                <Flex direction="column" gap={4}>
                    <FlexBlock>
                        <ToggleControl
                            label={sprintf(LABELS.gridControls.subgridPanel.columns.label, activeBreakpoint)}
                            help={LABELS.gridControls.subgridPanel.columns.help}
                            checked={subCols}
                            onChange={onToggleCols}
                        />
                    </FlexBlock>
                    <FlexBlock>
                        <ToggleControl
                            label={sprintf(LABELS.gridControls.subgridPanel.rows.label, activeBreakpoint)}
                            help={LABELS.gridControls.subgridPanel.rows.help}
                            checked={subRows}
                            onChange={onToggleRows}
                        />
                    </FlexBlock>
                </Flex>
            </PanelRow>
        </PanelBody>
    );
}
