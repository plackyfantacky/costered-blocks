import { __ } from "@wordpress/i18n";
import { useContext } from '@wordpress/element';

import { GridPanelContext } from '@components/composite/GridAxisControls/GridPanelGroup';
import CustomToggleGroup from "@components/CustomToggleGroup";


export function HeaderToggle() {
    const ctx = useContext(GridPanelContext);
    if (!ctx) throw new Error('useGridPanel must be used within <GridPanelGroup>.');
    
    const { active, setActive } = ctx;
    return (
        <CustomToggleGroup
            value={active}
            onChange={setActive}
        >
            <CustomToggleGroup.TextOption value="simple" label={__('Simple', 'costered-blocks')} />
            <CustomToggleGroup.TextOption value="tracks" label={__('Tracks', 'costered-blocks')} disabled />
            <CustomToggleGroup.TextOption value="areas" label={__('Areas', 'costered-blocks')} disabled />
            <CustomToggleGroup.TextOption value="presets" label={__('Presets', 'costered-blocks')} disabled />
        </CustomToggleGroup>
    );
}