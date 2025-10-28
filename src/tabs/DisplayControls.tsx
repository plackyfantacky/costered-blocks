import { Panel, PanelBody, Flex, FlexItem } from '@wordpress/components';
import { useCallback } from '@wordpress/element';

import { useSelectedBlockInfo, useAttrGetter, useAttrSetter, useSafeBlockName, useScopedKey, useUIPreferences } from "@hooks";
import { CustomSelectControl as SelectControl } from "@components/CustomSelectControl";
import { LABELS } from "@labels";
import {
    LucideBox as BoxIcon,
    MaterialSymbolsRemoveSelectionRounded as DefaultIcon,
    MaterialSymbolsBrickOutlineRounded as BrickOutlineRounded,
    MaterialSymbolsMatchWordRounded as MatchWordRounded,
    MaterialSymbolsFlexNoWrapRounded as FlexNoWrapRounded,
    MaterialSymbolsGridViewRounded as GridViewRounded,
    MdiBorderNoneVariant as BorderNoneVariant,
    MdiEyeOutline as EyeOutline,
    MdiEyeOffOutline as EyeOffOutline,
    IconoirCollapse as Collapse
} from "@assets/icons";
import { useEffect } from "react";

const DisplayControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    const name = selectedBlock?.name;
    if (!clientId) return null;

    const { get } = useAttrGetter(clientId);
    const { set } = useAttrSetter(clientId);

    const display: string = typeof get('display') === 'string' ? (get('display') as string) : '';
    const setDisplay = useCallback((value: string) => {
        set('display', value === '' ? undefined : value);
    }, [set]);

    const visibility: string = typeof get('visibility') === 'string' ? (get('visibility') as string) : '';
    const setVisibility = useCallback((value: string) => {
        set('visibility', value === '' ? undefined : value);
    }, [set]);

    const safeBlockName = useSafeBlockName(name, clientId ?? undefined);
    const displayPanelKey = useScopedKey('displayPanelOpen', { blockName: safeBlockName });
    const [displayPanelOpen, setDisplayPanelOpen] = useUIPreferences(displayPanelKey, true);

    return (
        <Panel className="costered-blocks--tab--display-controls">
            <PanelBody 
                title={LABELS.displayControls.panelTitle} 
                initialOpen={displayPanelOpen} 
                onToggle={setDisplayPanelOpen}
                className="costered-blocks--display-controls--inner"
            >
                <Flex direction="column" gap={4}>
                    <FlexItem className="costered-blocks--display-controls--display">
                        <SelectControl
                            label={LABELS.displayControls.displayLabel}
                            value={display}
                            onChange={setDisplay}
                        >
                            <SelectControl.Option value=""><DefaultIcon />{LABELS.displayControls.display.unset}</SelectControl.Option>
                            <SelectControl.Option value="block"><BrickOutlineRounded />{LABELS.displayControls.display.block}</SelectControl.Option>
                            <SelectControl.Option value="inline"><MatchWordRounded />{LABELS.displayControls.display.inline}</SelectControl.Option>
                            <SelectControl.Option value="flex"><FlexNoWrapRounded />{LABELS.displayControls.display.flex}</SelectControl.Option>
                            <SelectControl.Option value="grid"><GridViewRounded />{LABELS.displayControls.display.grid}</SelectControl.Option>
                            <SelectControl.Option value="none"><BorderNoneVariant />{LABELS.displayControls.display.none}</SelectControl.Option>
                        </SelectControl>
                    </FlexItem>
                    <FlexItem className="costered-blocks--display-controls--visibility">
                        <SelectControl
                            label={LABELS.displayControls.visibilityLabel}
                            value={visibility}
                            onChange={setVisibility}
                        >
                            <SelectControl.Option value=""><DefaultIcon />{LABELS.displayControls.visibility.unset}</SelectControl.Option>
                            <SelectControl.Option value="visible"><EyeOutline />{LABELS.displayControls.visibility.visible}</SelectControl.Option>
                            <SelectControl.Option value="hidden"><EyeOffOutline />{LABELS.displayControls.visibility.hidden}</SelectControl.Option>
                            <SelectControl.Option value="collapse"><Collapse />{LABELS.displayControls.visibility.collapse}</SelectControl.Option>
                        </SelectControl>
                    </FlexItem>
                </Flex>
            </PanelBody>
        </Panel>
    );
}

export default {
    name: "display-controls",
    title: LABELS.displayControls.panelTitle,
    icon: <BoxIcon />,
    render: () => <DisplayControls />
};
