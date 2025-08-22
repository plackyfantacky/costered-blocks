import { useMemo, useCallback, memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ToggleControl } from '@wordpress/components';
import { __experimentalGrid as Grid } from "@wordpress/components";

import UnitControlInput from "@components/UnitControlInput";
import TextControlInput from "@components/TextControlInput";

import { useAttrSetter } from "@hooks";

const GRID_MAP = {
    Top: { col: '4 / span 4', row: '1' },
    Left: { col: '1 / span 4', row: '2' },
    Right: { col: '7 / span 4', row: '2' },
    Bottom: { col: '4 / span 4', row: ' 3' },
};

function Rectangle() {
    return (
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
}

const FieldSlot = memo(function FieldSlot({ area, children }) {
    const grid = GRID_MAP[area];
    return (
        <div style={{ gridColumn: grid.col, gridRow: grid.row, zIndex: 2 }}>
            {children}
        </div>
    );
});

function DirectionalInputGroup({ prefix, attributes, clientId, updateAttributes }) {
    const { withPrefix } = useAttrSetter(updateAttributes, clientId);
    const ns = useMemo(() => withPrefix(prefix), [withPrefix, prefix]);

    const values = useMemo(() => ({
        Top: attributes?.[`${prefix}Top`] || '',
        Left: attributes?.[`${prefix}Left`] || '',
        Right: attributes?.[`${prefix}Right`] || '',
        Bottom: attributes?.[`${prefix}Bottom`] || '',
    }), [attributes, prefix]);

    const mode = attributes?.[`${prefix}Mode`] || 'unit';
    const Input = mode === 'unit' ? UnitControlInput : TextControlInput;



    const onChange = useCallback(
        (direction) => (next) => ns.set(direction, next),
        [ns]
    );

    const onToggleMode = useCallback(() => {
        ns.set(`Mode`, mode === 'unit' ? 'text' : 'unit');
    }, [ns, mode]);

    return (
        <Grid
            columns={10}
            templateRows={"repeat(4, fit-content)"}
            gap={2}
            style={{ marginBottom: '1rem', position: 'relative' }}
            __nextHasNoMarginBottom
        >
            <Rectangle />

            <FieldSlot area="Top">
                <Input
                    value={values.Top}
                    onChange={onChange('Top')}
                    label={__('Top', 'costered-blocks')}
                />
            </FieldSlot>
            <FieldSlot area="Left">
                <Input
                    value={values.Left}
                    onChange={onChange('Left')}
                    label={__('Left', 'costered-blocks')}
                />
            </FieldSlot>
            <FieldSlot area="Right">
                <Input
                    value={values.Right}
                    onChange={onChange('Right')}
                    label={__('Right', 'costered-blocks')}
                />
            </FieldSlot>
            <FieldSlot area="Bottom">
                <Input
                    value={values.Bottom}
                    onChange={onChange('Bottom')}
                    label={__('Bottom', 'costered-blocks')}
                />
            </FieldSlot>
            
            <div style={{ gridColumn: '1 / span 10', gridRow: '4' }}>
                <ToggleControl
                    label={__('Use custom values (e.g auto, calc)', 'costered-blocks')}
                    checked={mode === 'text'}
                    onChange={onToggleMode}
                    __nextHasNoMarginBottom
                />
            </div>
        </Grid>
    );
}

export default memo(DirectionalInputGroup, (prev, next) => {
    if (prev.clientId !== next.clientId) return false;
    if (prev.prefix !== next.prefix) return false;
    if (prev.updateAttributes !== next.updateAttributes) return false;

    const p = prev.prefix;
    const keys = [`${p}Mode`, `${p}Top`, `${p}Left`, `${p}Right`, `${p}Bottom`];

    for (const k of keys) {
        if (prev.attributes?.[k] !== next.attributes?.[k]) return false;
    }
    return true;
});