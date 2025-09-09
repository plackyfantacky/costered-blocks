import { isRTL } from '@wordpress/i18n';

import CustomToggleGroup from "@components/CustomToggleGroup";
import { LABELS } from "@labels";
import {
    EntypoAlignLeft as JustifyStart,
    EntypoAlignRight as JustifyEnd,
    HumbleiconsAlignObjectsCenter as JustifyCenter,
    JustifyGridStretch as JustifyStretch,
} from "@assets/icons";

export default function JustifySelfControl({ attributes, setJustifySelf }) {
    const rtl = isRTL();

    const JustifyStartIcon = rtl ? <JustifyEnd /> : <JustifyStart />;
    const JustifyEndIcon = rtl ? <JustifyStart /> : <JustifyEnd />;

    return (
        <CustomToggleGroup
            label={LABELS.gridItemsControls.justifySelf}
            value={attributes?.justifySelf ?? ''}
            onChange={setJustifySelf}
        >
            <CustomToggleGroup.IconOption value="start" icon={JustifyStartIcon} label={LABELS.gridItemsControls.justifySelfStart} />
            <CustomToggleGroup.IconOption value="center" icon={JustifyCenter} label={LABELS.gridItemsControls.justifySelfCenter} />
            <CustomToggleGroup.IconOption value="end" icon={JustifyEndIcon} label={LABELS.gridItemsControls.justifySelfEnd} />
            <CustomToggleGroup.IconOption value="stretch" icon={JustifyStretch} label={LABELS.gridItemsControls.justifySelfStretch} />
        </CustomToggleGroup>
    );
}
