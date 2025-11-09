import { isRTL } from '@wordpress/i18n';
import type { ReactNode } from '@wordpress/element';

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

type Props = {
    value: string;
    setAlignItems: ( value: string ) => void;
    clientId: string | null;
}

export default function AlignControl({ 
    value,
    setAlignItems,
    clientId
}: Props) {
    const rtl = isRTL();
    const { getString } = useAttrGetter(clientId ?? null);
    
    const flexDir = getString('flexDirection', '');
    const isRow = flexDir ? flexDir.includes('row') : true;

    const StartIcon: ReactNode = isRow ? (rtl ? <FlexAlignEnd /> : <FlexAlignStart />) : <FlexJustifyStart />;
    const EndIcon: ReactNode = isRow ? (rtl ? <FlexAlignStart /> : <FlexAlignEnd />) : <FlexJustifyEnd />;
    const CenterIcon: ReactNode = isRow ? <FlexAlignCenter /> : <FlexJustifyCenter />;
    const SpaceAroundIcon: ReactNode = isRow ? <FlexAlignSpaceAround /> : <FlexJustifySpaceAround />;
    const SpaceBetweenIcon: ReactNode = isRow ? <FlexAlignSpaceBetween /> : <FlexJustifySpaceBetween />;
    const SpaceEvenlyIcon: ReactNode = isRow ? <FlexAlignSpaceEven /> : <FlexJustifySpaceEven />;

    return (
        <CustomToggleGroup
            label={LABELS.alignControls.label}
            value={value}
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