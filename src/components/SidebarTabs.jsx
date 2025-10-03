import { useMemo, useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { TabPanel } from '@wordpress/components';

import { useParentAttrs } from "@hooks";

import { selectActiveBreakpoint } from '@stores/activeBreakpoint';
import { augmentAttributes } from '@utils/breakpointUtils';

import DimensionsControls from "@tabs/DimensionsControls";
import DisplayControls from "@tabs/DisplayControls";
import SpacingControls from "@tabs/SpacingControls";
import FlexBoxControls from "@tabs/FlexBoxControls";
import FlexItemControls from "@tabs/FlexItemControls";
import GridControls from "@tabs/GridControls";
import GridItemControls from "@tabs/GridItemControls";
import PositioningControls from "@tabs/PositioningControls";

const tabs = [
    DisplayControls,
    DimensionsControls,
    SpacingControls,
    FlexBoxControls,
    FlexItemControls,
    GridControls,
    GridItemControls,
    PositioningControls
];

const EMPTY_ATTRS = Object.freeze({});

export default function SidebarTabs() {
    // active breakpoint (read-only)
    const activeBreakpoint = useSelect(selectActiveBreakpoint, []);

    const { attributes, attrsVersion } = useSelect((select) => {
        const blockEditor = select(blockEditorStore);
        const id = blockEditor.getSelectedBlockClientId();
        if (!id) return { attributes: EMPTY_ATTRS, attrsVersion: '0|0', clientId: null };

        const attrs = blockEditor.getBlockAttributes(id) || EMPTY_ATTRS;
        // cheap version so re-render when nested styles mutate in-place
        const cheap = attrs?.costered || {};
        const version = `${Object.keys(cheap.desktop?.styles || {}).length}`
            + `|${Object.keys(cheap.tablet?.styles || {}).length}`
            + `|${Object.keys(cheap.mobile?.styles || {}).length}`;

        return { attributes: attrs, attrsVersion: version, clientId: id };
    }, []);

    const augmentedAttributes = useMemo(
        () => augmentAttributes(attributes, activeBreakpoint),
        [attributes, activeBreakpoint, attrsVersion]
    );

    const { parentAttrs } = useParentAttrs();

    const visibleTabs = useMemo(() => {
        return tabs.filter(t => {
            if (typeof t.isVisible === 'function') {
                const ctx = { attributes: augmentedAttributes, parentAttrs };
                let res = false;
                try {
                    res = t.isVisible(ctx) === true;
                } catch (e) {
                    console.error(`Error evaluating visibility for tab "${t.name}":`, e);
                }
                return res;
            }
            return true;
        });
    }, [augmentedAttributes, augmentedAttributes?.$bp, parentAttrs]);

    const panelTabs = useMemo(() => {
        return visibleTabs.map(({ name, title, icon }) => ({ name, title, icon }));
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

    const signature = useMemo(
        () => `${activeBreakpoint}:${panelTabs.map((tab) => tab.name).join(',')}`,
        [activeBreakpoint, panelTabs]
    );
            
    return (
        <TabPanel
            key={signature}
            className="costered-blocks--tab-panel-outer"
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