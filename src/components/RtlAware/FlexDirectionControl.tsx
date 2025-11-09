import { isRTL } from '@wordpress/i18n';
import type { ReactNode } from '@wordpress/element';

import { CustomSelectControl as SelectControl } from "@components/CustomSelectControl";
import { LABELS, t } from "@labels";
import {
    FlexDirectionColumn, 
    FlexDirectionColumnReverse, 
    FlexDirectionRow, 
    FlexDirectionRowReverse
} from "@assets/icons";

type Props = {
    value: string;
    setFlexDirection: ( value: string ) => void;
}

export default function FlexDirectionControl({
    value,
    setFlexDirection
}: Props) {
    const rtl = isRTL();

    const RowIcon: ReactNode = rtl ? <FlexDirectionRowReverse /> : <FlexDirectionRow />;
    const RowReverseIcon: ReactNode = rtl ? <FlexDirectionRow /> : <FlexDirectionRowReverse />;

    return (
        <SelectControl
            label={LABELS.flexDirection.label}
            value={value}
            onChange={setFlexDirection}
        >
            <SelectControl.Option value="row">{RowIcon} {LABELS.flexDirection.row}</SelectControl.Option>
            <SelectControl.Option value="row-reverse">{RowReverseIcon} {LABELS.flexDirection.rowReverse}</SelectControl.Option>
            <SelectControl.Option value="column"><FlexDirectionColumn /> {LABELS.flexDirection.column}</SelectControl.Option>
            <SelectControl.Option value="column-reverse"><FlexDirectionColumnReverse /> {LABELS.flexDirection.columnReverse}</SelectControl.Option>
        </SelectControl>
    )
}