import { useMemo, useCallback, memo } from '@wordpress/element';
import { ToggleControl } from '@wordpress/components';
import { __experimentalGrid as Grid } from "@wordpress/components";

import { LABELS } from '@labels';
import UnitControlInput from "@components/UnitControlInput";
import TextControlInput from "@components/TextControlInput";

import { useAttrSetter, useUIPreferences, scopedKey, useSafeBlockName } from "@hooks";

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

function DirectionalInputGroup({ prefix, attributes, clientId, updateBlockAttributes, blockName = null }) {
    const { withPrefix } = useAttrSetter(updateBlockAttributes, clientId);
    const ns = useMemo(() => withPrefix(prefix), [withPrefix, prefix]);

    const values = useMemo(() => ({
        Top: attributes?.[`${prefix}Top`] || '',
        Left: attributes?.[`${prefix}Left`] || '',
        Right: attributes?.[`${prefix}Right`] || '',
        Bottom: attributes?.[`${prefix}Bottom`] || '',
    }), [attributes, prefix]);

    const safeBlockName = useSafeBlockName(blockName, clientId);

    const modeKey = `${prefix}Mode`;
    const prefKey = scopedKey(modeKey, { blockName: safeBlockName });
    const [mode, setMode] = useUIPreferences(prefKey, 'unit');

    const Input = mode === 'unit' ? UnitControlInput : TextControlInput;

    const onChange = useCallback(
        (direction) => (next) => ns.set(direction, next),
        [ns]
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

            <FieldSlot area="Top">
                <Input
                    value={values.Top}
                    onChange={onChange('Top')}
                    label={LABELS.directionalInputGroup.top}
                />
            </FieldSlot>
            <FieldSlot area="Left">
                <Input
                    value={values.Left}
                    onChange={onChange('Left')}
                    label={LABELS.directionalInputGroup.left}
                />
            </FieldSlot>
            <FieldSlot area="Right">
                <Input
                    value={values.Right}
                    onChange={onChange('Right')}
                    label={LABELS.directionalInputGroup.right}
                />
            </FieldSlot>
            <FieldSlot area="Bottom">
                <Input
                    value={values.Bottom}
                    onChange={onChange('Bottom')}
                    label={LABELS.directionalInputGroup.bottom}
                />
            </FieldSlot>
            
            <div style={{ gridColumn: '1 / span 10', gridRow: '4' }}>
                <ToggleControl
                    label={LABELS.directionalInputGroup.useCustom}
                    checked={mode === 'text'}
                    onChange={(isUnit) => setMode(isUnit ? 'text' : 'unit')}
                    __nextHasNoMarginBottom
                />
            </div>
        </Grid>
    );
}

export default memo(DirectionalInputGroup, (prev, next) => {
    if (prev.clientId !== next.clientId) return false;
    if (prev.prefix !== next.prefix) return false;
    if (prev.updateBlockAttributes !== next.updateBlockAttributes) return false;

    const p = prev.prefix;
    const keys = [`${p}Mode`, `${p}Top`, `${p}Left`, `${p}Right`, `${p}Bottom`];

    for (const k of keys) {
        if (prev.attributes?.[k] !== next.attributes?.[k]) return false;
    }
    return true;
});