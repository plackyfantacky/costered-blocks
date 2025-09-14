import NumberControlInput from '@components/NumberControlInput';
import { Notice } from '@wordpress/components';
import { isIntToken, parseSigned } from '@utils/gridPlacement';

const maxInteger = Number.MAX_SAFE_INTEGER;

export default function AxisEndNumber({ label, help, token, draftValue, onChange, disabled, zeroNotice }) {
    return (
        <>
            <NumberControlInput
                label={label}
                value={draftValue !== null ? draftValue : (isIntToken(token) ? parseSigned(token) : '')}
                onChange={onChange}
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
