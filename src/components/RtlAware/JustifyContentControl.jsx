import { isRTL } from '@wordpress/i18n';

import { useAttrGetter } from '@hooks';

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

export default function JustifyControl({ value, setJustifyContent, clientId }) {
    const rtl = isRTL();
    const { get } = useAttrGetter(clientId);
    const isRow = get('flexDirection') ? get('flexDirection').includes('row') : true;

    const StartIcon = isRow ? (rtl ? <FlexJustifyEnd /> : <FlexJustifyStart />) : <FlexAlignStart />;
    const EndIcon = isRow ? (rtl ? <FlexJustifyStart /> : <FlexJustifyEnd />) : <FlexAlignEnd />;
    const CenterIcon = isRow ? <FlexJustifyCenter /> : <FlexAlignCenter />;
    const SpaceAroundIcon = isRow ? <FlexJustifySpaceAround /> : <FlexAlignSpaceAround />;
    const SpaceBetweenIcon = isRow ? <FlexJustifySpaceBetween /> : <FlexAlignSpaceBetween />;
    const SpaceEvenlyIcon = isRow ? <FlexJustifySpaceEven /> : <FlexAlignSpaceEven />;

    return (
        <CustomToggleGroup
            label={LABELS.justifyControls.label}
            value={value}
            onChange={setJustifyContent}
        >
            <CustomToggleGroup.IconOption value="flex-start" icon={StartIcon} label={LABELS.justifyControls.start} />
            <CustomToggleGroup.IconOption value="flex-end" icon={EndIcon} label={LABELS.justifyControls.end} />
            <CustomToggleGroup.IconOption value="center" icon={CenterIcon} label={LABELS.justifyControls.center} />
            <CustomToggleGroup.IconOption value="space-around" icon={SpaceAroundIcon} label={LABELS.justifyControls.spaceAround} />
            <CustomToggleGroup.IconOption value="space-between" icon={SpaceBetweenIcon} label={LABELS.justifyControls.spaceBetween} />
            <CustomToggleGroup.IconOption value="space-evenly" icon={SpaceEvenlyIcon} label={LABELS.justifyControls.spaceEvenly} />
        </CustomToggleGroup>
    );
}