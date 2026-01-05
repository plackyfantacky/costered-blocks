import { useMemo, useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { TabPanel } from '@wordpress/components';

import { useParentAttrs } from "@hooks";
import { selectActiveBreakpoint } from '@stores/activeBreakpoint';
import { augmentAttributes } from '@utils/breakpointUtils';

import BlockControls from "@tabs/BlockControls";
import DebugControls from "@tabs/DebugControls";
import DimensionsControls from "@tabs/DimensionsControls";
import DisplayControls from "@tabs/DisplayControls";
import SpacingControls from "@tabs/SpacingControls";
import FlexBoxControls from "@tabs/FlexBoxControls";
import FlexItemControls from "@tabs/FlexItemControls";
import GridControls from "@tabs/GridControls";
import GridItemControls from "@tabs/GridItemControls";
import PositioningControls from "@tabs/PositioningControls";

import type { ReactNode } from '@wordpress/element';
import type { AugmentedAttributes, VisibilityCtx } from "@types";

type TabDef = {
    name: string;
    title: ReactNode;
    icon?: ReactNode;
    render?: () => ReactNode;
    content?: ReactNode | null;
    isVisible?: (ctx: VisibilityCtx) => boolean;
};

const tabs: readonly TabDef[] = [
    BlockControls,
    DisplayControls,
    DimensionsControls,
    SpacingControls,
    FlexBoxControls,
    FlexItemControls,
    GridControls,
    GridItemControls,
    PositioningControls,
    DebugControls
];

type SidebarTabsProps = {
    className?: string;
};

const EMPTY_ATTRS: Readonly<Record<string, never>> = Object.freeze({});

export default function SidebarTabs({ className }: SidebarTabsProps) {
    // active breakpoint (read-only)
    const activeBreakpoint = useSelect(selectActiveBreakpoint, []);

    const {
        attributes, 
        attrsVersion, 
        blockName
    } = useSelect((select: any) => {
        const editor = select(blockEditorStore);
        const clientId = editor.getSelectedBlockClientId();

        
        if (!clientId) {
            return { 
                attributes: EMPTY_ATTRS, 
                attrsVersion: '0|0|0', 
                blockName: null
            };
        }

        const attrs = (editor.getBlockAttributes(clientId) || EMPTY_ATTRS) as Record<string, unknown>;
        const costered = (attrs as any)?.costered || {};

        const version =
            `${Object.keys(costered.desktop?.styles || {}).length}` +
            `|${Object.keys(costered.tablet?.styles || {}).length}` +
            `|${Object.keys(costered.mobile?.styles || {}).length}`;

        const selectedBlock = editor.getSelectedBlock();
        const name = selectedBlock?.name ?? null;

        return { 
            attributes: attrs, 
            attrsVersion: version, 
            blockName: name
        };
    }, []);

    const augmentedAttributes = useMemo<AugmentedAttributes>(
        () => augmentAttributes(attributes as any, activeBreakpoint as any),
        [attributes, activeBreakpoint, attrsVersion]
    );

    const { parentAttrs } = useParentAttrs(undefined);

    const visibleTabs = useMemo(() => {
        return tabs.filter(tabDef => {
            if (typeof tabDef.isVisible === 'function') {
                const ctx: VisibilityCtx = { 
                    attributes: augmentedAttributes,
                    parentAttrs,
                    blockName
                };

                try {
                    return tabDef.isVisible(ctx) === true;
                } catch (error) {
                    console.error(`Error evaluating visibility for tab "${tabDef.name}":`, error);
                    return false;
                }
            }
            return true;
        });
    }, [augmentedAttributes, parentAttrs, blockName]);

    if (!visibleTabs.length) {
        return null;
    }

    const panelTabs = useMemo(() => {
        return visibleTabs.map(({ name, title, icon }) => ({ name, title, icon }));
    }, [visibleTabs]);

    const tabByName = useMemo(() => {
        return new Map(visibleTabs.map((t) => [t.name, t]));
    }, [visibleTabs]);

    const [activeName, setActiveName] = useState<string | undefined>(undefined);

    const safeActiveName = useMemo(() => {
        if (!visibleTabs.length) return undefined;

        if (activeName && visibleTabs.some((tab) => tab.name === activeName)) {
            return activeName;
        }

        return visibleTabs[0]?.name;
    }, [visibleTabs, activeName]);

    useEffect(() => {
        if (safeActiveName !== activeName) {
            setActiveName(safeActiveName);
        }
    }, [safeActiveName, activeName]);

    const signature = useMemo(
        () => `${activeBreakpoint}:${safeActiveName ?? ''}:${panelTabs.map((tab) => tab.name).join(',')}`,
        [activeBreakpoint, safeActiveName, panelTabs]
    );
            
    return (
        <TabPanel
            key={signature}
            className={['costered-blocks--tab-panel-outer', className].filter(Boolean).join(' ')}
            tabs={panelTabs}
            onSelect={setActiveName}
            initialTabName={safeActiveName}
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