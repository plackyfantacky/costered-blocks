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
    setJustifyContent: ( value: string ) => void;
    clientId: string | null;
}

export default function JustifyControl({
    value,
    setJustifyContent,
    clientId
}: Props) {
    const rtl = isRTL();
    const { getString } = useAttrGetter(clientId ?? null);

    const flexDir = getString('flexDirection', '');
    const isRow = flexDir ? flexDir.includes('row') : true;

    const StartIcon: ReactNode = isRow ? (rtl ? <FlexJustifyEnd /> : <FlexJustifyStart />) : <FlexAlignStart />;
    const EndIcon: ReactNode = isRow ? (rtl ? <FlexJustifyStart /> : <FlexJustifyEnd />) : <FlexAlignEnd />;
    const CenterIcon: ReactNode = isRow ? <FlexJustifyCenter /> : <FlexAlignCenter />;
    const SpaceAroundIcon: ReactNode = isRow ? <FlexJustifySpaceAround /> : <FlexAlignSpaceAround />;
    const SpaceBetweenIcon: ReactNode = isRow ? <FlexJustifySpaceBetween /> : <FlexAlignSpaceBetween />;
    const SpaceEvenlyIcon: ReactNode = isRow ? <FlexJustifySpaceEven /> : <FlexAlignSpaceEven />;

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