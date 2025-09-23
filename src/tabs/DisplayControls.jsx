import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexItem } from '@wordpress/components';
import { useCallback } from '@wordpress/element';

import { useSelectedBlockInfo, useAttrSetter } from "@hooks";
import { CustomSelectControl as SelectControl } from "@components/CustomSelectControl";
import { LABELS } from "@labels";
import {
    LucideBox as BoxIcon,
    MaterialSymbolsRemoveSelectionRounded as DefaultIcon,
    MaterialSymbolsBrickOutlineRounded as BrickOulineRounded,
    MaterialSymbolsMatchWordRounded as MatchWordRounded,
    MaterialSymbolsFlexNoWrapRounded as FlexNoWrapRounded,
    MaterialSymbolsGridViewRounded as GridViewRounded,
    MdiBorderNoneVariant as BorderNoneVariant,
    MdiEyeOutline as EyeOutline,
    MdiEyeOffOutline as EyeOffOutline,
    IconoirCollapse as Collapse
} from "@assets/icons";

const DisplayControls = () => {
    const { selectedBlock, clientId } = useSelectedBlockInfo();
    if (!selectedBlock) return null;

    return (
        <DisplayControlsInner
            clientId={clientId}
            attributes={selectedBlock.attributes}
        />
    );
}

const DisplayControlsInner = ({clientId, attributes }) => {
    const { updateBlockAttributes } = useDispatch('core/block-editor');
    const { set } = useAttrSetter(updateBlockAttributes, clientId);

    const setDisplay = useCallback((v) => set('display', v), [set]);
    const setVisibility = useCallback((v) => set('visibility', v), [set]);

    return (
        <Panel className="costered-blocks--tab--display-controls">
            <PanelBody title={LABELS.displayControls.panelTitle} initialOpen={true} className="costered-blocks--display-controls--inner">
                <Flex direction="column" gap={4}>
                    <FlexItem className="costered-blocks--display-controls--display">
                        <SelectControl
                            label={LABELS.displayControls.displayLabel}
                            value={typeof attributes?.display === "string" ? attributes.display : ""}
                            onChange={setDisplay}
                        >
                            <SelectControl.Option value=""><DefaultIcon />{LABELS.displayControls.display.unset}</SelectControl.Option>
                            <SelectControl.Option value="block"><BrickOulineRounded />{LABELS.displayControls.display.block}</SelectControl.Option>
                            <SelectControl.Option value="inline"><MatchWordRounded />{LABELS.displayControls.display.inline}</SelectControl.Option>
                            <SelectControl.Option value="flex"><FlexNoWrapRounded />{LABELS.displayControls.display.flex}</SelectControl.Option>
                            <SelectControl.Option value="grid"><GridViewRounded />{LABELS.displayControls.display.grid}</SelectControl.Option>
                            <SelectControl.Option value="none"><BorderNoneVariant />{LABELS.displayControls.display.none}</SelectControl.Option>
                        </SelectControl>
                    </FlexItem>
                    <FlexItem className="costered-blocks--display-controls--visibility">
                        <SelectControl
                            label={LABELS.displayControls.visibilityLabel}
                            value={typeof attributes?.visibility === "string" ? attributes.visibility : ""}
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
};

export default {
    name: "display-controls",
    title: LABELS.displayControls.panelTitle,
    icon: <BoxIcon />,
    render: () => <DisplayControls />
};
