import { FlexItem, __experimentalUnitControl as UnitControl } from '@wordpress/components';

export default function UnitControlInput(props) {
    const { value, onChange, label } = props;
    const formattedLabel = label.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

    const allowedUnits = [
        {
            name: 'rem',
            value: 'rem',
            label: 'rem'
        },
        {
            name: 'px',
            value: 'px',
            label: 'px'
        },
        {
            name: 'em',
            value: 'em',
            label: 'em'
        },
        {
            name: '%',
            value: '%',
            label: '%'
        },
        {
            name: 'vw',
            value: 'vw',
            label: 'vw'
        },
        {
            name: 'vh',
            value: 'vh',
            label: 'vh'
        }
    ];

    return (
        <UnitControl
            __next40pxDefaultSize
            label={formattedLabel}
            value={value}
            onChange={onChange}
            placeholder="0"
            style={{ padding: '0 2px' }}
            units={allowedUnits}
            isResettable
            allowReset
        />
    );
}