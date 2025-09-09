import { isRTL } from '@wordpress/i18n';

import CustomToggleGroup from "@components/CustomToggleGroup";
import { LABELS } from "@labels";
import {
    AlignSelfBaseline,
    AlignSelfStretch,
    EntypoAlignTop as AlignStart,
    MaterialSymbolsVerticalAlignCenterRounded as AlignCenter,
    EntypoAlignBottom as AlignEnd,
} from "@assets/icons";

export default function AlignSelfControl({ attributes, setAlignSelf, includeBaseline = false }) {
    const rtl = isRTL();

    const AlignStartIcon = rtl ? <AlignEnd /> : <AlignStart />;
    const AlignEndIcon = rtl ? <AlignStart /> : <AlignEnd />;

    return (
        <CustomToggleGroup
            label={LABELS.alignControls.label}
            value={attributes?.alignSelf ?? ''}
            onChange={setAlignSelf}
        >
            <CustomToggleGroup.IconOption value="start" icon={AlignStartIcon} label={LABELS.alignControls.start} />
            <CustomToggleGroup.IconOption value="center" icon={AlignCenter} label={LABELS.alignControls.center} />
            <CustomToggleGroup.IconOption value="end" icon={AlignEndIcon} label={LABELS.alignControls.end} />
            { includeBaseline && /* optional - used in FlexItemControls  */
                <CustomToggleGroup.IconOption value="baseline" icon={AlignSelfBaseline} label={LABELS.alignControls.baseline} />
            }
            <CustomToggleGroup.IconOption value="stretch" icon={AlignSelfStretch} label={LABELS.alignControls.stretch} />
        </CustomToggleGroup>
    );
}  