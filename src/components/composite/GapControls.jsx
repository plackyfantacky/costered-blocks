import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useState, useEffect } from '@wordpress/element';
import { Button, Flex, FlexBlock, FlexItem, ToggleControl } from '@wordpress/components';

import UnitControlInput from "@components/UnitControlInput";
import TextControlInput from "@components/TextControlInput";

import { useAttrSetter, useUIPreferences, scopedKey, useSafeBlockName } from "@hooks";

import { SplitInput, JoinInput } from "@assets/icons";

const splitGap = (s = '') =>
    (s + '').trim().split(/\s+(?![^(]*\))/).filter(Boolean).slice(0, 2);

const joinGap = (row = '', col = '') =>
    [row, col].filter(Boolean).join(' ').trim();

const normalize = (v) => (v == null ? '' : String(v).trim());

/**
 * Renders a pair of input controls for gap attributes (rowGap and columnGap).
 * Allows toggling between single and dual gap controls.
 * Will also render a toggle control to switch between unit and text input modes.
 * 
 * @param {Object} attributes - The block attributes containing the values to edit.
 * @param {string} clientId - The client ID of the block being edited.
 * @param {Function} updateAttributes - Function to update block attributes.
 * 
 * @returns {JSX.Element} A FlexBox containing the gap input and toggle controls.
 */
export function GapControls({ attributes, clientId, updateAttributes, blockName = null }) {
    const { set } = useAttrSetter(updateAttributes, clientId);

    //user preferences for unit/text mode
    const safeBlockName = useSafeBlockName(blockName, clientId);
    const unitModePrefKey = scopedKey('gapMode', { blockName: safeBlockName });
    const [unitMode, setUnitMode] = useUIPreferences(unitModePrefKey, 'unit');

    const inputModePrefKey = scopedKey('gapInputMode', { blockName: safeBlockName });
    const [inputMode, setInputMode] = useUIPreferences(inputModePrefKey, 'single');

    //initial values
    const initialValue = attributes?.gap || '';

    //control mode state (either 'single' or 'dual'). if not defined, determine from initial value

    useEffect(() => {
        if (inputMode === undefined) {
            setInputMode(splitGap(initialValue).length === 2 ? 'dual' : 'single');
        }
    }, [inputMode, initialValue]);

    //split initial value into row and column parts
    const [row, col] = useMemo(() => {
        const parts = splitGap(initialValue);
        return [parts[0] || '', parts[1] || ''];
    }, [initialValue]);

    //actually setting the values
    const setRow = useCallback((next) => {
        const n = normalize(next);
        if (inputMode === 'single') {
            set('gap', n ? n : undefined);
        } else {
            const joined = joinGap(n, col);
            set('gap', joined ? joined : undefined);
        }
    }, [inputMode, set, col]);

    const setCol = useCallback((next) => {
        const n = normalize(next);
        const joined = joinGap(row, n);
        set('gap', joined ? joined : undefined);
    }, [set, row]);

    const Input = unitMode === 'unit' ? UnitControlInput : TextControlInput;
    const labelText = inputMode === 'single' ? __('Gap', 'costered-blocks') : __('Row Gap', 'costered-blocks');


    //toggle between single and dual input modes
    const onToggleInputMode = useCallback(() => {
        setInputMode(inputMode  === 'single' ? 'dual' : 'single');
    }, [inputMode, setInputMode]);

    //toggle between unit and text input modes
    const onUnitToggleMode = useCallback(() => {
        setUnitMode(unitMode === 'unit' ? 'text' : 'unit');
    }, [unitMode, setUnitMode]);

    return (
        <Flex direction={"column"} className="gap-controls">
            <FlexBlock>
                <Flex align="flex-end" gap={1}>                    
                    <FlexBlock>
                        <Flex gap={0} direction="row">
                            <FlexItem>
                                <Input label={labelText} value={inputMode === 'single' ? initialValue : row} onChange={setRow} allowReset={true} />
                            </FlexItem>
                            {inputMode === 'dual' && (
                                <FlexItem>
                                    <Input label={__('Column Gap', 'costered-blocks')} value={col} onChange={setCol} allowReset={true} />
                                </FlexItem>
                            )}
                        </Flex>
                    </FlexBlock>
                    <FlexItem>
                        <Button
                            icon={inputMode === 'single' ? SplitInput : JoinInput}
                            label={inputMode === 'single' ? __('Switch to Dual Gap', 'costered-blocks') : __('Switch to Single Gap', 'costered-blocks')}
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
                    label={__('Use custom values (e.g auto, calc)', 'costered-blocks')}
                    checked={unitMode === 'text'}
                    onChange={onUnitToggleMode}
                />
            </FlexBlock>
        </Flex>
    );
}