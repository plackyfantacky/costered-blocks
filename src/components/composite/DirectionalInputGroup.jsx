import { useMemo, useCallback, memo } from '@wordpress/element';
import { ToggleControl } from '@wordpress/components';
import { __experimentalGrid as Grid } from "@wordpress/components";

import { LABELS } from '@labels';
import UnitControlInput from "@components/UnitControlInput";
import TextControlInput from "@components/TextControlInput";

import { useAttrSetter, useUIPreferences, useScopedKey, useSafeBlockName } from "@hooks";

const GRID_MAP = {
    Top: { col: '4 / span 4', row: '1' },
    Left: { col: '1 / span 4', row: '2' },
    Right: { col: '7 / span 4', row: '2' },
    Bottom: { col: '4 / span 4', row: '3' },
};

const FieldSlot = memo(function FieldSlot({ area, children }) {
    const grid = GRID_MAP[area];
    return (
        <div style={{ gridColumn: grid.col, gridRow: grid.row, zIndex: 2 }}>
            {children}
        </div>
    );
});

function DirectionalInputGroup({ prefix, attributes, clientId, updateBlockAttributes, blockName = null, prefixed }) {
    //prefixed by default so marginTop, paddingTop, etc are used. if false, just top, left for positioning, etc.
    
    const { set, withPrefix } = useAttrSetter(updateBlockAttributes, clientId);
    const isPrefixed = typeof prefixed === 'boolean' ? prefixed : Boolean(prefix);
    
    const ns = useMemo(
        () => (isPrefixed ? withPrefix(prefix) : null),
        [withPrefix, prefix, isPrefixed]
    );

    const resolveKey = useCallback(
        (direction) => isPrefixed ? `${prefix}${direction}` : direction.toLowerCase(),
        [isPrefixed, prefix]
    );

    const values = useMemo(() => ({
        Top: attributes?.[resolveKey('Top')] ?? '',
        Left: attributes?.[resolveKey('Left')] ?? '',
        Right: attributes?.[resolveKey('Right')] ?? '',
        Bottom: attributes?.[resolveKey('Bottom')] ?? '',
    }), [attributes, resolveKey]);

    const safeBlockName = useSafeBlockName(blockName, clientId);

    // Preference key: `${prefix}Mode` when prefixed, else shared `positionCoordinatesMode`
    const modeKey = isPrefixed ? `${prefix}Mode` : `positionCoordinatesMode`;
    const prefKey = useScopedKey(modeKey, { blockName: safeBlockName });
    const [mode, setMode] = useUIPreferences(prefKey, 'unit');
    const Input = mode === 'unit' ? UnitControlInput : TextControlInput;

    const onChange = useCallback(
        (direction) => (next) => {
            if (ns) {
                ns.set(direction, next);
            } else {
                set(resolveKey(direction), next);
            }
        }, [ns, set, resolveKey]
    );

    return (
        <Grid className="costered-blocks--directional-input-group" columns={10} templateRows={"repeat(4, fit-content)"} gap={2} __nextHasNoMarginBottom>
            <div className="costered-blocks--directional-input-group--rectangle" /> {/* Background rectangle */}
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

            <div className="costered-blocks--directional-input-group--toggle">
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

export default memo(DirectionalInputGroup, (previous, next) => {
    if (previous.clientId !== next.clientId) return false;
    if (previous.updateBlockAttributes !== next.updateBlockAttributes) return false;
    if (previous.prefix !== next.prefix) return false;

    const prevPref = typeof previous.prefixed === 'boolean' ? previous.prefixed : Boolean(next.prefixed);
    const nextPref = typeof next.prefixed === 'boolean' ? next.prefixed : Boolean(previous.prefixed);
    if (prevPref !== nextPref) return false;

    const p = previous.prefix;
    const keys = prevPref
        ? [`${p}Mode`, `${p}Top`, `${p}Left`, `${p}Right`, `${p}Bottom`]
        : [`positionCoordinatesMode`, `top`, `left`, `right`, `bottom`];

    for (const key of keys) {
        if (previous.attributes?.[key] !== next.attributes?.[key]) return false;
    }
    return true;
});