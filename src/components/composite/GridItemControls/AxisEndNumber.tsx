import { Notice } from '@wordpress/components';
import type { ReactNode } from '@wordpress/element';

import NumberControlInput from '@components/NumberControlInput';
import { isIntToken, parseSigned } from '@utils/gridPlacement';

const maxInteger = Number.MAX_SAFE_INTEGER;

type Props = {
    label: ReactNode;
    help?: ReactNode;
    token: string | number | undefined;
    draftValue: number | null;
    onChange: (value: number | '') => void;
    disabled?: boolean;
    zeroNotice: ReactNode;
};

export default function AxisEndNumber({
    label,
    help,
    token,
    draftValue,
    onChange,
    disabled = false,
    zeroNotice
}: Props) {
    let value: number | '' = '';
    if (draftValue !== null) {
        value = draftValue;
    } else if (isIntToken(token)) {
        const num = typeof token === 'number' ? token : Number(token);
        value = parseSigned(num);
    }

    const handleChange = (next: number | '') => {
        onChange(next);
    }

    return (
        <>
            <NumberControlInput
                label={label}
                value={value}
                onChange={handleChange}
                min={-maxInteger}
                isDragEnabled
                disabled={disabled}
                help={help}
            />
            {draftValue === 0 && (
                <Notice status="warning" isDismissible={false}>
                    {zeroNotice}
                </Notice>
            )}
        </>
    );
}