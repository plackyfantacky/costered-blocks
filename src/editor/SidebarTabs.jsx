import { useMemo, useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { TabPanel } from '@wordpress/components';

import { useParentAttrs } from "@lib/hooks";

import DimensionsControls from "@tabs/DimensionsControls";
import DisplayControls from "@tabs/DisplayControls";
import SpacingControls from "@tabs/SpacingControls";
import FlexBoxControls from "@tabs/FlexBoxControls";
import FlexItemControls from "@tabs/FlexItemControls";

const tabs = [
    DisplayControls,
    DimensionsControls,
    SpacingControls,
    FlexBoxControls,
    FlexItemControls,
];

export default function SidebarTabs() {
    const { attributes } = useSelect((select) => {
        const b = select(blockEditorStore).getSelectedBlock();
        return { attributes: b ? b.attributes : {} };
    }, []);

    const { parentAttrs } = useParentAttrs();

    const visibleTabs = useMemo(() => {
        return tabs.filter(t => {
            if (typeof t.isVisible === 'function') {
                const ctx = { attributes, parentAttrs };
                try {
                    return t.isVisible(ctx) === true;
                } catch (e) {
                    console.error(`Error evaluating visibility for tab "${t.name}":`, e);
                    return false;
                }
            }
            return true;
        });
    }, [attributes, parentAttrs]);

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
            key={visibleTabs.map((t) => t.name).join('|')}
            className="costered-blocks-sidebar-tabs"
            tabs={visibleTabs.map(({ name, title, icon }) => ({ name, title, icon }))}
            onSelect={setActiveName}
            initialTabName={activeName}
        >
            {(tab) => {
                const tabDef = visibleTabs.find((t) => t.name === tab.name);
                const Component = tabDef?.render || null;
                if (Component) {
                    return <Component />;
                }
                return tabDef?.content ?? null;
            }}
        </TabPanel>
    );
}