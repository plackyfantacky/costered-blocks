import { useMemo, useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { TabPanel } from '@wordpress/components';

import { useParentAttrs } from "@hooks";

import DimensionsControls from "@tabs/DimensionsControls";
import DisplayControls from "@tabs/DisplayControls";
import SpacingControls from "@tabs/SpacingControls";
import FlexBoxControls from "@tabs/FlexBoxControls";
import FlexItemControls from "@tabs/FlexItemControls";
import GridControls from "@tabs/GridControls";
import GridItemControls from "@tabs/GridItemControls";

const tabs = [
    DisplayControls,
    DimensionsControls,
    SpacingControls,
    FlexBoxControls,
    FlexItemControls,
    GridControls,
    GridItemControls
];

const EMPTY_ATTRS = Object.freeze({});

export default function SidebarTabs() {

    const { attributes } = useSelect((select) => {
        const be = select(blockEditorStore);
        const id = be.getSelectedBlockClientId();
        if (!id) return { attributes: EMPTY_ATTRS, clientId: null };

        const attrs = be.getBlockAttributes(id) || EMPTY_ATTRS;
        return { attributes: attrs, clientId: id };
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

    const panelTabs = useMemo(() => {
        return visibleTabs.map(({name, title, icon}) => ({ name, title, icon }));
    }, [visibleTabs]);

    const tabByName = useMemo(() => {
        return new Map(visibleTabs.map((t) => [t.name, t]));
    }, [visibleTabs]);

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

    const signature = useMemo(() => panelTabs.map((t) => t.name).join('|'), [panelTabs]);

    return (
        <TabPanel
            key={signature}
            className="costered-blocks-sidebar-tabs"
            tabs={panelTabs}
            onSelect={setActiveName}
            initialTabName={activeName}
        >
            {(tab) => {
                const def = tabByName.get(tab.name);
                const Component = def?.render || null;
                if (Component) return <Component />;
                return def?.content ?? null;
            }}
        </TabPanel>
    );
}