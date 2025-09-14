import NumberControlInput from '@components/NumberControlInput';
import { toInt } from '@utils/gridPlacement';

export default function AxisSpan({ label, help, value, cap, onChange, disabled }) {
    return (
        <NumberControlInput
            label={label}
            value={toInt(value, 1)}
            onChange={onChange}
            min={1}
            max={Number.isFinite(cap) ? cap : undefined}
            isDragEnabled
            disabled={disabled}
            help={help}
        />
    );
}