import { isRTL } from '@wordpress/i18n';
import type { ReactNode } from '@wordpress/element';

import {
    AlignSelfBaseline,
    AlignSelfStretch,
    EntypoAlignTop as AlignStart,
    MaterialSymbolsVerticalAlignCenterRounded as AlignCenter,
    EntypoAlignBottom as AlignEnd,
} from "@assets/icons";
import CustomToggleGroup from "@components/CustomToggleGroup";
import { LABELS } from "@labels";

type Props = {
    value: string;
    setAlignSelf: ( value: string ) => void;
    includeBaseline?: boolean; // optional - used in FlexItemControls
}

export default function AlignSelfControl({
    value,
    setAlignSelf,
    includeBaseline = false
}: Props) {
    const rtl = isRTL();

    const AlignStartIcon: ReactNode = rtl ? <AlignEnd /> : <AlignStart />;
    const AlignEndIcon: ReactNode = rtl ? <AlignStart /> : <AlignEnd />;
    const AlignCenterIcon: ReactNode = <AlignCenter />;
    const AlignSelfStretchIcon: ReactNode = <AlignSelfStretch />;
    const AlignSelfBaselineIcon: ReactNode = <AlignSelfBaseline />;

    return (
        <CustomToggleGroup
            label={LABELS.alignControls.label}
            value={value}
            onChange={setAlignSelf}
        >
            <CustomToggleGroup.IconOption value="start" icon={AlignStartIcon} label={LABELS.alignControls.start} />
            <CustomToggleGroup.IconOption value="center" icon={AlignCenterIcon} label={LABELS.alignControls.center} />
            <CustomToggleGroup.IconOption value="end" icon={AlignEndIcon} label={LABELS.alignControls.end} />
            { includeBaseline && /* optional - used in FlexItemControls  */
                <CustomToggleGroup.IconOption value="baseline" icon={AlignSelfBaselineIcon} label={LABELS.alignControls.baseline} />
            }
            <CustomToggleGroup.IconOption value="stretch" icon={AlignSelfStretchIcon} label={LABELS.alignControls.stretch} />
        </CustomToggleGroup>
    );
}  