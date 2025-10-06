import { __, isRTL } from '@wordpress/i18n';

import { CustomSelectControl as SelectControl } from "@components/CustomSelectControl";
import { LABELS } from "@labels";
import {
    FlexDirectionColumn, 
    FlexDirectionColumnReverse, 
    FlexDirectionRow, 
    FlexDirectionRowReverse
} from "@assets/icons";

export default function FlexDirectionControl({ value, setFlexDirection }) {
    const rtl = isRTL();

    const RowIcon = rtl ? <FlexDirectionRowReverse /> : <FlexDirectionRow />;
    const RowReverse = rtl ? <FlexDirectionRow /> : <FlexDirectionRowReverse />;
    
    return (
        <SelectControl
            label={LABELS.flexDirection.label}
            value={value}
            onChange={setFlexDirection}
        >
            <SelectControl.Option value="row">{RowIcon} {LABELS.flexDirection.row}</SelectControl.Option>
            <SelectControl.Option value="row-reverse">{RowReverse} {LABELS.flexDirection.rowReverse}</SelectControl.Option>
            <SelectControl.Option value="column"><FlexDirectionColumn /> {LABELS.flexDirection.column}</SelectControl.Option>
            <SelectControl.Option value="column-reverse"><FlexDirectionColumnReverse /> {LABELS.flexDirection.columnReverse}</SelectControl.Option>
        </SelectControl>
    )
}