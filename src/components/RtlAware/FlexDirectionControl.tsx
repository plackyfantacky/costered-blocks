import { isRTL } from '@wordpress/i18n';
import type { ReactNode } from '@wordpress/element';

import { CustomSelectControl as SelectControl } from "@components/CustomSelectControl";
import Icon from "@components/Icon";
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

    return (
        <SelectControl
            label={LABELS.flexDirection.label}
            value={value}
            onChange={setFlexDirection}
        >
            <SelectControl.Option value="row"><Icon icon={ rtl ? FlexDirectionRowReverse : FlexDirectionRow } /> {LABELS.flexDirection.row}</SelectControl.Option>
            <SelectControl.Option value="row-reverse"><Icon icon={ rtl ? FlexDirectionRow : FlexDirectionRowReverse } /> {LABELS.flexDirection.rowReverse}</SelectControl.Option>
            <SelectControl.Option value="column"><Icon icon={ FlexDirectionColumn } /> {LABELS.flexDirection.column}</SelectControl.Option>
            <SelectControl.Option value="column-reverse"><Icon icon={ FlexDirectionColumnReverse } /> {LABELS.flexDirection.columnReverse}</SelectControl.Option>
        </SelectControl>
    )
}