import NumberControlInput from '@components/NumberControlInput';
import { isIntToken, toInt } from '@utils/gridPlacement';

const maxInteger = Number.MAX_SAFE_INTEGER;

export default function AxisStartNumber({ label, value, onChange, disabled }) {
    return (
        <NumberControlInput
            label={label}
            value={isIntToken(value) ? toInt(value, 1) : 1}
            onChange={onChange}
            min={-maxInteger}             // allow negatives (and 0) for auto-flow semantics
            disabled={disabled}
        />
    );
}
