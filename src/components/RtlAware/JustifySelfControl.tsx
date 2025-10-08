import { isRTL } from '@wordpress/i18n';
import type { ReactNode } from 'react';

import CustomToggleGroup from "@components/CustomToggleGroup";
import { LABELS } from "@labels";
import {
    EntypoAlignLeft as JustifyStart,
    EntypoAlignRight as JustifyEnd,
    HumbleiconsAlignObjectsCenter as JustifyCenter,
    JustifyGridStretch as JustifyStretch,
} from "@assets/icons";

type Props = {
    value: string;
    setJustifySelf: ( value: string ) => void;
}

export default function JustifySelfControl({
    value, 
    setJustifySelf
}: Props) {
    const rtl = isRTL();

    const JustifyStartIcon: ReactNode = rtl ? <JustifyEnd /> : <JustifyStart />;
    const JustifyEndIcon: ReactNode = rtl ? <JustifyStart /> : <JustifyEnd />;
    const JustifyCenterIcon: ReactNode = <JustifyCenter />;
    const JustifyStretchIcon: ReactNode = <JustifyStretch />;

    return (
        <CustomToggleGroup
            label={LABELS.justifySelfControl.label}
            value={value}
            onChange={setJustifySelf}
        >
            <CustomToggleGroup.IconOption value="start" icon={JustifyStartIcon} label={LABELS.justifySelfControl.start} />
            <CustomToggleGroup.IconOption value="center" icon={JustifyCenterIcon} label={LABELS.justifySelfControl.center} />
            <CustomToggleGroup.IconOption value="end" icon={JustifyEndIcon} label={LABELS.justifySelfControl.end} />
            <CustomToggleGroup.IconOption value="stretch" icon={JustifyStretchIcon} label={LABELS.justifySelfControl.stretch} />
        </CustomToggleGroup>
    );
}
