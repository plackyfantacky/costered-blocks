import { useMemo, useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { TabPanel } from '@wordpress/components';

import DimensionsControls from "@tabs/DimensionsControls";
import DisplayControls from "@tabs/DisplayControls";
import SpacingControls from "@tabs/SpacingControls";
import FlexBoxControls from "@tabs/FlexBoxControls";

const tabs = [
    DisplayControls,
    DimensionsControls,
    SpacingControls,
    FlexBoxControls,
];

export default function SidebarTabs() {
    const { attributes } = useSelect((select) => {
        const b = select(blockEditorStore).getSelectedBlock();
        return { attributes: b ? b.attributes : {} };
    }, []);

    const visibleTabs = useMemo(() => {
        return tabs.filter(t => {
            if (typeof t.isVisible === 'function') {
                try {
                    return (
                        t.isVisible({attributes}) === true || 
                        t.isVisible(attributes) === true
                    );
                } catch (e) {
                    console.error(`Error evaluating visibility for tab "${t.name}":`, e);
                    // If a tab throws using one signature, fall back to the other.
                    try { return t.isVisible(attributes) === true; } catch { return false; }
                }
            }
            return true;
        });
    }, [attributes]);

    const [activeName, setActiveName] = useState(visibleTabs[0]?.name);

    useEffect(() => {
        if (!visibleTabs.length) {
            setActiveName(undefined);
            return;
        }
        if (!visibleTabs.find((t) => t.name === activeName)) {
            setActiveName(visibleTabs[0].name);
        }
    }, [visibleTabs, activeName]);

    return (
        <TabPanel
            className="costered-blocks-sidebar-tabs"
            tabs={visibleTabs.map(({ name, title, icon }) => ({ name, title, icon }))}
            onSelect={setActiveName}
            initialTabName={activeName}
        >
            {(tab) => {
                const tabDef = visibleTabs.find((t) => t.name === tab.name);
                return typeof tabDef?.render === 'function'
                    ? tabDef.render()
                    : (tabDef?.content ?? null);
            }}
        </TabPanel>
    );
}