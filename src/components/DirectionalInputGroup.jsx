import { BaseControl, Flex, FlexItem, Rect, ToggleControl } from '@wordpress/components';
import { __experimentalGrid as Grid } from "@wordpress/components";

import UnitControlInput from "@components/UnitControlInput";
import TextControlInput from "@components/TextControlInput";

function DirectionalInputGroup({ prefix, attributes, clientId, updateAttributes }) {
    const mode = attributes?.[`${prefix}Mode`] || 'unit';

    const toggleMode = () => {
        const next = mode === 'unit' ? 'text' : 'unit';
        updateAttributes(clientId, {
            ...attributes,
            [`${prefix}Mode`]: next
        });
    };

    const handleChange = (direction) => (val) => {
        updateAttributes(clientId, {
            ...attributes,
            [`${prefix}${direction}`]: val
        });
    };

    const InputField = ({ direction, label = direction }) => {
        const key = `${prefix}${direction}`;
        const value = attributes?.[key];
        const gridMap = {
            Top: { col: '4 / span 4', row: '1' },
            Left: { col: '1 / span 4', row: '2' },
            Right: { col: '7 / span 4', row: '2' },
            Bottom: { col: '4 / span 4', row: ' 3' },
        };

        const Input = mode === 'unit' ? UnitControlInput : TextControlInput;
        return (
            <div style={{ gridColumn: gridMap[direction].col, gridRow: gridMap[direction].row, zIndex: 2 }}>
                <Input value={value} onChange={handleChange(direction)} label={label} />
            </div>
        );
    };

    const Rectangle = () => (
        <div style={{
            position: 'absolute',
            top: '43px',
            left: '45px',
            right: '45px',
            bottom: '58px',
            border: '1px solid #ccc',
            zIndex: 1,
        }} />
    );

    return (
        <Grid
            columns={10}
            templateRows={"repeat(4, fit-content)"}
            gap={2}
            style={{ marginBottom: '1rem', position: 'relative' }}
            __nextHasNoMarginBottom
        >
            <Rectangle />
            <InputField direction="Top" label="Top" />
            <InputField direction="Left" label="Left" />
            <InputField direction="Right" label="Right" />
            <InputField direction="Bottom" label="Bottom" />
            <div style={{ gridColumn: '1 / span 10', gridRow: '4' }}>
                <ToggleControl
                    label="Use custom values (e.g auto, calc)"
                    checked={mode === 'unit'}
                    onChange={toggleMode}
                    __nextHasNoMarginBottom
                />
            </div>
        </Grid>
    );
}

export default DirectionalInputGroup;