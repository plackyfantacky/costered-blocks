import { FlexItem, __experimentalUnitControl as UnitControl } from '@wordpress/components';

export default function UnitControlInput({ value, onChange, label }) {

    const allowedUnits = [
        {
            name: 'px',
            value: 'px',
            label: 'px'
        }, {
            name: 'em',
            value: 'em',
            label: 'em'
        }, {
            name: 'rem',
            value: 'rem',
            label: 'rem'
        }, {
            name: '%',
            value: '%',
            label: '%'
        }, {
            name: 'vw',
            value: 'vw',
            label: 'vw'
        }, {
            name: 'vh',
            value: 'vh',
            label: 'vh'
        }
    ];

    return (
        <FlexItem>
            <UnitControl
                __next40pxDefaultSize
                label={label}
                value={value}
                onChange={onChange}
                placeholder="0"
                style={{ padding: '0 2px' }}
                units={allowedUnits}
                isResettable
                allowReset
            />
        </FlexItem>
    );
}