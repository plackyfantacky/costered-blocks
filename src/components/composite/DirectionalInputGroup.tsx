import { useMemo, useCallback, memo } from '@wordpress/element';
import { ToggleControl } from '@wordpress/components';
import { __experimentalGrid as Grid } from "@wordpress/components";

import { LABELS } from '@labels';
import UnitControlInput from "@components/UnitControlInput";
import TextControlInput from "@components/TextControlInput";

import { useAttrGetter, useAttrSetter, useUIPreferences, 
    useScopedKey, useSafeBlockName } from "@hooks";

type Direction = 'Top' | 'Left' | 'Right' | 'Bottom';

type Props = {
    prefix?: string;
    clientId: string;
    blockName?: string | null;
    prefixed?: boolean;
}

type CommonInputProps = {
    id?: string;
    label?: React.ReactNode;
    value: string;
    onChange: (value: string | number) => void;
}

const GRID_MAP: Record<Direction, { col: string; row: string }> = {
    Top: { col: '4 / span 4', row: '1' },
    Left: { col: '1 / span 4', row: '2' },
    Right: { col: '7 / span 4', row: '2' },
    Bottom: { col: '4 / span 4', row: '3' },
};

const FieldSlot = memo(function FieldSlot({ area, children }: { area: Direction; children: React.ReactNode }) {
    const grid = GRID_MAP[area];
    return (
        <div style={{ gridColumn: grid.col, gridRow: grid.row, zIndex: 2 }}>
            {children}
        </div>
    );
});

function DirectionalInputGroup({ prefix, clientId, blockName = null, prefixed } : Props) {
    //prefixed by default so marginTop, paddingTop, etc are used. if false, just top, left for positioning, etc.

    const { get } = useAttrGetter(clientId);
    const { set, withPrefix } = useAttrSetter(clientId);
    const isPrefixed = typeof prefixed === 'boolean' ? prefixed : Boolean(prefix);
    
    const ns = useMemo(
        () => (isPrefixed && prefix ? withPrefix(prefix) : null),
        [withPrefix, prefix, isPrefixed]
    );

    const resolveKey = useCallback(
        (direction: Direction) => isPrefixed ? `${prefix}${direction}` : direction.toLowerCase(),
        [isPrefixed, prefix]
    );

    const values = useMemo(
        () => ({
            Top: get(resolveKey('Top')) ?? '',
            Left: get(resolveKey('Left')) ?? '',
            Right: get(resolveKey('Right')) ?? '',
            Bottom: get(resolveKey('Bottom')) ?? '',
        }),
        [get, resolveKey]
    );

    const safeBlockName = useSafeBlockName(blockName, clientId);

    const idBase = useMemo(() => `costered-directional-input-${clientId}-${isPrefixed ? prefix : 'unprefixed'}`, [clientId, isPrefixed, prefix]);

    // Preference key: `${prefix}Mode` when prefixed, else shared `positionCoordinatesMode`
    const modeKey = isPrefixed && prefix ? `${prefix}Mode` : `positionCoordinatesMode`;
    const scopeKey = useScopedKey(modeKey, safeBlockName ? { blockName: safeBlockName } : undefined);
    const [mode, setMode] = useUIPreferences(scopeKey, 'unit');
    
    const Input = (mode === 'unit' ? UnitControlInput : TextControlInput) as React.ComponentType<CommonInputProps>;

    const onChangeText = useCallback(
        (direction: Direction) => (next: string) => {
            const nextStr = next ?? '';
            if (ns) ns.set(direction, nextStr);
            else set(resolveKey(direction), nextStr);
        },
        [ns, set, resolveKey]
    );
    
    const onChangeUnit = useCallback(
        (direction: Direction) => (next: string | number) => {
            const nextStr = typeof next === 'number' ? String(next) : next;
            if (ns) ns.set(direction, nextStr);
            else set(resolveKey(direction), nextStr);
        }, [ns, set, resolveKey]
    );

    const renderField = useCallback(
        (direction: Direction, label: string, idSuffix: string) => {
            const id: string = `${idBase}-${idSuffix}`;
            const value = values[direction]; // likely CSSPrimitive (string|number|'')

            return mode === 'unit' ? (
                <UnitControlInput
                    id={id}
                    label={label}
                    value={value ?? ''}
                    onChange={onChangeUnit(direction)}
                />
            ) : (
                <TextControlInput
                    id={id}
                    label={label}
                    value={value ?? ''}
                    onChange={onChangeText(direction)}
                />
            );
        },
        [mode, values, onChangeText, onChangeUnit, idBase]
    );

    return (
        <Grid
            className="costered-blocks--directional-input-group"
            columns={10}
            rows={"repeat(4, fit-content)"}
            gap={2}
            __nextHasNoMarginBottom
        >
            <div className="costered-blocks--directional-input-group--rectangle" /> {/* Background rectangle */}
            <FieldSlot area="Top">
                { renderField('Top', LABELS.directionalInputGroup.top, 'top') }
            </FieldSlot>
            <FieldSlot area="Left">
                { renderField('Left', LABELS.directionalInputGroup.left, 'left') }
            </FieldSlot>
            <FieldSlot area="Right">
                { renderField('Right', LABELS.directionalInputGroup.right, 'right') }
            </FieldSlot>
            <FieldSlot area="Bottom">
                { renderField('Bottom', LABELS.directionalInputGroup.bottom, 'bottom')  }
            </FieldSlot>

            <div className="costered-blocks--directional-input-group--toggle">
                <ToggleControl
                    label={LABELS.directionalInputGroup.useCustom}
                    checked={mode === 'text'}
                    onChange={(checked: boolean) => setMode(checked ? 'text' : 'unit')}
                    __nextHasNoMarginBottom
                />
            </div>
        </Grid>
    );
}

export default memo(DirectionalInputGroup, (previous, next) => {
    // Only compare real props. Reading attrs is handled via hooks inside.
    if (previous.clientId !== next.clientId) return false;
    if (previous.blockName !== next.blockName) return false;
    if (previous.prefix !== next.prefix) return false;

    const prevPref = typeof previous.prefixed === 'boolean' ? previous.prefixed : Boolean(previous.prefix);
    const nextPref = typeof next.prefixed === 'boolean' ? next.prefixed : Boolean(next.prefix);
    if (prevPref !== nextPref) return false;
    return true;
});