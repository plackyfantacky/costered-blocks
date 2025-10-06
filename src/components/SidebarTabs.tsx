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

import type { ReactNode } from 'react';
import type { AugmentedAttributes } from "@types";

type VisibleCtx = {
    attributes: AugmentedAttributes;
    parentAttrs: Record<string, unknown> | null;
}

type TabDef = {
    name: string;
    title: ReactNode;
    icon?: ReactNode;
    render?: () => ReactNode;
    content?: ReactNode | null;
    isVisible?: (ctx: VisibleCtx) => boolean;
};

const tabs: readonly TabDef[] = [
    DisplayControls,
    DimensionsControls,
    SpacingControls,
    FlexBoxControls,
    FlexItemControls,
    GridControls,
    GridItemControls,
    PositioningControls
];

type SidebarTabsProps = {
    className?: string;
};

const EMPTY_ATTRS: Readonly<Record<string, never>> = Object.freeze({});

export default function SidebarTabs({ className }: SidebarTabsProps) {
    // active breakpoint (read-only)
    const activeBreakpoint = useSelect(selectActiveBreakpoint, []);

    const { attributes, attrsVersion } = useSelect((select: any) => {
        const blockEditor = select(blockEditorStore);
        const id: string | null = blockEditor.getSelectedBlockClientId();
        if (!id) return { attributes: EMPTY_ATTRS, attrsVersion: '0|0', clientId: null };

        const attrs = (blockEditor.getBlockAttributes(id) || EMPTY_ATTRS) as Record<string, unknown>;
        // cheap version so re-render when nested styles mutate in-place
        const cheap = (attrs as any)?.costered || {};
        const version =
            `${Object.keys(cheap.desktop?.styles || {}).length}` +
            `|${Object.keys(cheap.tablet?.styles || {}).length}` +
            `|${Object.keys(cheap.mobile?.styles || {}).length}`;

        return { attributes: attrs, attrsVersion: version, clientId: id };
    }, []);

    const augmentedAttributes = useMemo<AugmentedAttributes>(
        () => augmentAttributes(attributes as any, activeBreakpoint as any),
        [attributes, activeBreakpoint, attrsVersion]
    );

    const { parentAttrs } = useParentAttrs(undefined);

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
    }, [augmentedAttributes, (augmentedAttributes as any)?.$bp, parentAttrs]);

    const panelTabs = useMemo(() => {
        return visibleTabs.map(({ name, title, icon }) => ({ name, title, icon }));
    }, [visibleTabs]);

    const tabByName = useMemo(() => {
        return new Map(visibleTabs.map((t) => [t.name, t]));
    }, [visibleTabs]);

    const [activeName, setActiveName] = useState<string | undefined>(visibleTabs[0]?.name);

    useEffect(() => {
        if (!visibleTabs.length) {
            setActiveName(undefined);
            return;
        }
        if (!visibleTabs.find((tab) => tab.name === activeName)) {
            setActiveName(visibleTabs[0]?.name);
        }
    }, [visibleTabs, activeName]);

    const signature = useMemo(
        () => `${activeBreakpoint}:${panelTabs.map((tab) => tab.name).join(',')}`,
        [activeBreakpoint, panelTabs]
    );
            
    return (
        <TabPanel
            key={signature}
            className={['costered-blocks--tab-panel-outer', className].filter(Boolean).join(' ')}
            tabs={panelTabs}
            onSelect={setActiveName}
            initialTabName={activeName}
        >
            {(tab: { name: string }) => {
                const def = tabByName.get(tab.name);
                const Component = def?.render || null;
                if (Component) return <Component />;
                return def?.content ?? null;
            }}
        </TabPanel>
    );
}