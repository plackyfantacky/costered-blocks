import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { Panel, PanelBody, Flex, FlexItem } from '@wordpress/components';
import { useCallback } from '@wordpress/element';

import { useSelectedBlockInfo, useAttrSetter } from "@hooks";
import { CustomSelectControl as SelectControl } from "@components/CustomSelectControl";

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

/*
    hopefully this is the only instance that needs this fix, but here is a weird one: prior to this change, if you 
    set a block to `display:flex` or `display:grid`, then setting it to `display:block` and clicking anywhere outside
    of the selected block...BOOM you get:
    "Uncaught Error: Rendered fewer hooks than expected. This may be caused by an accidental early return statement."
    the culprit is the return null statement below, but don't ask my why as I still don't know why going from flex/grid
    to block causes it to happen.
 */
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
        <Panel>
            <PanelBody title={__('Display', 'costered-blocks')} initialOpen={true} style={{ gap: '10rem' }}>
                <Flex direction="column" gap={4} style={{ marginBottom: '1rem' }}>
                    <FlexItem>
                        <SelectControl
                            label={__('Display', 'costered-blocks')}
                            value={typeof attributes?.display === "string" ? attributes.display : ""}
                            onChange={setDisplay}
                        >
                            <SelectControl.Option value=""><DefaultIcon />{__('unset / initial', 'costered-blocks')}</SelectControl.Option>
                            <SelectControl.Option value="block"><BrickOulineRounded />{__('Block', 'costered-blocks')}</SelectControl.Option>
                            <SelectControl.Option value="inline"><MatchWordRounded />{__('Inline', 'costered-blocks')}</SelectControl.Option>
                            <SelectControl.Option value="flex"><FlexNoWrapRounded />{__('Flex', 'costered-blocks')}</SelectControl.Option>
                            <SelectControl.Option value="grid"><GridViewRounded />{__('Grid', 'costered-blocks')}</SelectControl.Option> 
                            <SelectControl.Option value="none"><BorderNoneVariant />{__('None', 'costered-blocks')}</SelectControl.Option>
                        </SelectControl>
                    </FlexItem>
                    <FlexItem>
                        <SelectControl
                            label={__('Visibility', 'costered-blocks')}
                            value={typeof attributes?.visibility === "string" ? attributes.visibility : ""}
                            onChange={setVisibility}
                        >
                            <SelectControl.Option value=""><DefaultIcon />{__('unset / initial', 'costered-blocks')}</SelectControl.Option>
                            <SelectControl.Option value="visible"><EyeOutline />{__('Visible', 'costered-blocks')}</SelectControl.Option>
                            <SelectControl.Option value="hidden"><EyeOffOutline />{__('Hidden', 'costered-blocks')}</SelectControl.Option>
                            <SelectControl.Option value="collapse"><Collapse />{__('Collapse', 'costered-blocks')}</SelectControl.Option>
                        </SelectControl>
                    </FlexItem>
                </Flex>
            </PanelBody>
        </Panel>
    );
};

export default {
    name: "display-controls",
    title: __('Display Controls', 'costered-blocks'),
    icon: <BoxIcon />,
    render: () => <DisplayControls />
};
