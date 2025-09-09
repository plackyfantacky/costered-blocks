import { isRTL } from '@wordpress/i18n';

import CustomToggleGroup from "@components/CustomToggleGroup";
import { LABELS } from "@labels";
import {
    EntypoAlignLeft as FlexJustifyStart, 
    EntypoAlignRight as FlexJustifyEnd, 
    HumbleiconsAlignObjectsCenter as FlexJustifyCenter, 
    MaterialSymbolsAlignJustifySpaceAround as FlexJustifySpaceAround, 
    MaterialSymbolsAlignJustifySpaceBetween as FlexJustifySpaceBetween,
    MaterialSymbolsAlignJustifySpaceEven as FlexJustifySpaceEven, 
    EntypoAlignTop as FlexAlignStart, 
    EntypoAlignBottom as FlexAlignEnd, 
    MaterialSymbolsVerticalAlignCenterRounded as FlexAlignCenter, 
    MaterialSymbolsAlignSpaceAround as FlexAlignSpaceAround, 
    MaterialSymbolsAlignSpaceBetween as FlexAlignSpaceBetween, 
    MaterialSymbolsAlignSpaceEven as FlexAlignSpaceEven
} from "@assets/icons";

export default function AlignControl({ attributes, setAlignItems }) {
    const rtl = isRTL();
    const isRow = attributes?.flexDirection ? attributes.flexDirection.includes('row') : true;

    const StartIcon = isRow ? (rtl ? <FlexAlignEnd /> : <FlexAlignStart />) : <FlexJustifyStart />;
    const EndIcon = isRow ? (rtl ? <FlexAlignStart /> : <FlexAlignEnd />) : <FlexJustifyEnd />;
    const CenterIcon = isRow ? <FlexAlignCenter /> : <FlexJustifyCenter />;
    const SpaceAroundIcon = isRow ? <FlexAlignSpaceAround /> : <FlexJustifySpaceAround />;
    const SpaceBetweenIcon = isRow ? <FlexAlignSpaceBetween /> : <FlexJustifySpaceBetween />;
    const SpaceEvenlyIcon = isRow ? <FlexAlignSpaceEven /> : <FlexJustifySpaceEven />;

    return (
        <CustomToggleGroup
            label={LABELS.alignControls.label}
            value={attributes?.alignItems ?? ''}
            onChange={setAlignItems}
        >
            <CustomToggleGroup.IconOption value="flex-start" icon={StartIcon} label={LABELS.alignControls.start} />
            <CustomToggleGroup.IconOption value="flex-end" icon={EndIcon} label={LABELS.alignControls.end} />
            <CustomToggleGroup.IconOption value="center" icon={CenterIcon} label={LABELS.alignControls.center} />
            <CustomToggleGroup.IconOption value="space-around" icon={SpaceAroundIcon} label={LABELS.alignControls.spaceAround} />
            <CustomToggleGroup.IconOption value="space-between" icon={SpaceBetweenIcon} label={LABELS.alignControls.spaceBetween} />
            <CustomToggleGroup.IconOption value="space-evenly" icon={SpaceEvenlyIcon} label={LABELS.alignControls.spaceEvenly} />
        </CustomToggleGroup>
    );
}