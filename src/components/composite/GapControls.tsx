import { useCallback, useMemo, useState, useEffect } from '@wordpress/element';
import { Button, Flex, FlexBlock, FlexItem, ToggleControl } from '@wordpress/components';

import { SplitInput, JoinInput } from "@assets/icons";
import { useAttrGetter, useAttrSetter, useUIPreferences, useScopedKey, useSafeBlockName } from "@hooks";
import { splitGap, joinGap, normalize } from '@utils/gapUtils';
import { LABELS } from '@labels';

import CSSMeasurementControl from '@components/CSSMeasurementControl';

type Props = {
    clientId: string;
    blockName?: string | null;
};

/**
 * Renders a pair of input controls for gap attributes (rowGap and columnGap).
 * Allows toggling between single and dual gap controls.
 * Will also render a toggle control to switch between unit and text input modes.
 * 
 */
export default function GapControls({ clientId, blockName = null }: Props) {

    const { getString } = useAttrGetter(clientId);
    const { set } = useAttrSetter(clientId);

    //user preferences for unit/text mode
    const safeBlockName = useSafeBlockName(blockName ?? undefined, clientId);
    const unitModePrefKey = useScopedKey('gapMode', { blockName: safeBlockName });
    const [unitMode, setUnitMode] = useUIPreferences<'unit' | 'text'>(unitModePrefKey, 'unit');

    const inputModePrefKey = useScopedKey('gapInputMode', { blockName: safeBlockName });
    const [inputMode, setInputMode] = useUIPreferences<'single' | 'dual'>(inputModePrefKey, 'single');

    //initial values
    const initialValue: string = getString('gap');

    //control mode state (either 'single' or 'dual'). if not defined, determine from initial value

    useEffect(() => {
        if (inputMode === undefined) {
            setInputMode(splitGap(initialValue).length === 2 ? 'dual' : 'single');
        }
    }, [inputMode, initialValue]);

    //split initial value into row and column parts
    const [rowPart, colPart] = useMemo(() => {
        const parts = splitGap(initialValue);
        return [parts[0] ?? '', parts[1] ?? ''];
    }, [initialValue]);

    //actually setting the values
    const setRow = useCallback(
        (next: string) => {
            const n = normalize(next);
            if (inputMode === 'single') {
                set('gap', n ? n : undefined);
            } else {
                const joined = joinGap(n, colPart);
                set('gap', joined ? joined : undefined);
            }
        },
        [inputMode, set, colPart]
    );

    const setCol = useCallback((next: string) => {
        const n = normalize(next);
        const joined = joinGap(rowPart, n);
        set('gap', joined ? joined : undefined);
    }, [set, rowPart]);

    //toggle between single and dual input modes
    const onToggleInputMode = useCallback(() => {
        setInputMode(inputMode  === 'single' ? 'dual' : 'single');
    }, [inputMode, setInputMode]);

    //toggle between unit and text input modes
    const onUnitToggleMode = useCallback(() => {
        setUnitMode(unitMode === 'unit' ? 'text' : 'unit');
    }, [unitMode, setUnitMode]);

    const labelText = inputMode === 'single' ? LABELS.gapControls.label : LABELS.gapControls.columnLabel;

    return (
        <Flex direction={"column"} className="gap-controls">
            <FlexBlock>
                <Flex align="flex-end" gap={1}>                    
                    <FlexBlock>
                        <Flex gap={0} direction="row" align="flex-end">
                            <FlexItem>
                                <CSSMeasurementControl
                                    mode={unitMode}
                                    label={labelText}
                                    allowReset
                                    clientId={clientId}
                                    prop="gap"
                                />
                            </FlexItem>
                            {inputMode === 'dual' && (
                                <FlexItem>
                                    <CSSMeasurementControl
                                        mode={unitMode}
                                        label={LABELS.gapControls.rowLabel}
                                        allowReset
                                        clientId={clientId}
                                        prop="gap"
                                    />
                                </FlexItem>
                            )}
                        </Flex>
                    </FlexBlock>
                    <FlexItem>
                        <Button
                            icon={inputMode === 'single' ? SplitInput : JoinInput}
                            label={
                                inputMode === 'single'
                                    ? LABELS.gapControls.switchToDual
                                    : LABELS.gapControls.switchToSingle
                            }
                            onClick={onToggleInputMode}
                            style={{ marginBottom: '2px' }}
                            aria-pressed={inputMode === 'dual'}
                        />
                    </FlexItem>
                </Flex>
            </FlexBlock>
            <FlexBlock>
            </FlexBlock>
            <FlexBlock>
                <ToggleControl
                    label={LABELS.gapControls.useCustom}
                    checked={unitMode === 'text'}
                    onChange={onUnitToggleMode}
                    __nextHasNoMarginBottom
                    __next40pxDefaultSize
                />
            </FlexBlock>
        </Flex>
    );
}