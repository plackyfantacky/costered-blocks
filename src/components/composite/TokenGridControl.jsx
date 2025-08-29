import { __ } from '@wordpress/i18n';
import { useCallback, useMemo, useRef, useState } from '@wordpress/element';
import { Button, TextControl, Flex, FlexItem, Tooltip, Notice } from '@wordpress/components';
import { plus, trash, arrowUp, arrowDown } from '@wordpress/icons';

function splitRow(line, separator) {
    return String(line || '').trim().split(separator).filter(Boolean);
}

function joinRow(tokens) {
    return tokens.join(' ');
}

function parseValue(value, separator) {
    if (!Array.isArray(value)) return [];
    return value.map((line) => splitRow(line, separator));
}

function stringifyRows(rows) {
    return rows.map(joinRow);
}

function toRectangle(rows, filler) {
    const max = rows.reduce((m, r) => Math.max(m, r.length), 0);
    if (max === 0) return rows;
    return rows.map((row) => (row.length === max ? row : [...row, ...Array(max - row.length).fill(filler)]));
}

export default function TokenGridControl({
    value = [],
    onChange,
    placeholderToken = '.',
    allowEmptyToken = true,
    minRows = 1,
    normaliseToRectangle = true,
    tokenPattern = /^[A-Za-z_.-][A-Za-z0-9_.-]*$/,
    dedupeWithinRow = false,
    separator = /\s+/,
    label = __('Tokens', 'costered-blocks'),
    help,
    addRowLabel = __('Add row', 'costered-blocks'),
    addTokenAria = __('Add token to this row', 'costered-blocks'),
    inputLabel = __('Add token', 'costered-blocks'),
}) {
    const [input, setInput] = useState('');
    const inputRef = useRef(null);

    const rows = useMemo(() => {
        const parsed = parseValue(value, separator);
        if (parsed.length === 0 && minRows > 0) {
            return Array.from({ length: minRows }, () => []);
        }
        return parsed;
    }, [ value, separator, minRows ]);

    const commit = useCallback(( rows2d ) => {
        const next = normaliseToRectangle ? toRectangle(rows2d, placeholderToken) : rows2d;
        onChange?.(stringifyRows(next));
    }, [ onChange, normaliseToRectangle, placeholderToken ]);

    const validate = useCallback((t) => {
        if (!t) return allowEmptyToken;
        return tokenPattern.test(t);
    }, [ tokenPattern, allowEmptyToken ]);

    const addToken = useCallback(( rowIndex, raw ) => {
        const proposed = String(raw || '').trim();
        const token = proposed || (allowEmptyToken ? placeholderToken : '');
        if (!token) return;
        if (!validate(token)) return;

        const next = rows.map((row, index) => {
            if (index !== rowIndex) return row;
            const candidate = dedupeWithinRow && token !== placeholderToken ? row.filter((t) => t !== token) : row;
            return [...candidate, token];
        });
        commit(next);
        setInput('');
        inputRef.current?.focus();
    }, [ rows, commit, allowEmptyToken, placeholderToken, validate, dedupeWithinRow ]);

    const replaceToken = useCallback(( rowIndex, tokenIndex, raw ) => {
        const proposed = String(raw || '').trim();
        const token = proposed || (allowEmptyToken ? placeholderToken : '');
        if (!token) return;
        if (!validate(token)) return;

        const next = rows.map((row, index) => {
            if (index !== rowIndex) return row;
            const row2 = [...row];
            row2[tokenIndex] = token;
            return row2;
        });
        commit(next);
    }, [ rows, commit, allowEmptyToken, placeholderToken, validate ]);

    const removeToken = useCallback(( rowIndex, tokenIndex ) => {
        const next = rows.map((row, i) => {
            if (i !== rowIndex) return row;
            const row2 = [...row];
            row2.splice(tokenIndex, 1);
            return row2;
        });
        commit(next);
    }, [rows, commit]);

    const addRow = useCallback(() => {
        const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
        const newRow = normaliseToRectangle && width > 0 ? Array(width).fill(placeholderToken) : [];
        commit([...rows, newRow]);
    }, [ rows, commit, normaliseToRectangle, placeholderToken ]);

    const removeRow = useCallback(( rowIndex ) => {
        if (rows.length <= minRows) return;
        const next = rows.filter((row, index) => index !== rowIndex);
        commit(next);
    }, [ rows, commit, minRows ]);

    const moveRow = useCallback(( rowIndex, dir ) => {
        const target = rowIndex + dir;
        if (target < 0 || target >= rows.length) return;
        const next = [...rows];
        const tmp = next[rowIndex];
        next[rowIndex] = next[target];
        next[target] = tmp;
        commit(next);
    }, [ rows, commit ]);

    const onSubmitNew = useCallback((e) => {
        e.preventDefault();
        if (!rows.length) return;
        addToken(rows.length - 1, input);
    }, [ rows.length, addToken, input ]);

    const onKeyDownInput = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmitNew(e);
        }
        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            addRow();
            setTimeout(() => inputRef.current?.focus(), 0);
        }
        if (e.key === 'Backspace' && !input && rows.length) {
            // Convenience: backspace on empty input removes last token of last row
            const lastRowIdx = rows.length - 1;
            const last = rows[lastRowIdx];
            if (last.length) removeToken(lastRowIdx, last.length - 1);
        }
    }, [ input, onSubmitNew, addRow, rows, removeToken ]);

    const invalidExample = input && !validate(input);

    return (
        <div className="costered-token-grid">
            <div style={{ display: 'grid', gap: '8px' }}>
                <form onSubmit={onSubmitNew} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <TextControl
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                            label={label}
                            value={input}
                            onChange={setInput}
                            onKeyDown={onKeyDownInput}
                            placeholder={__('Type a token and press Enter', 'costered-blocks')}
                            ref={inputRef}
                            help={help}
                        />
                    </div>
                    <Button
                        icon={plus}
                        variant="primary"
                        onClick={onSubmitNew}
                        aria-label={__('Add token to last row', 'costered-blocks')}
                    />
                    <Button
                        onClick={addRow}
                        variant="secondary"
                    >
                        {addRowLabel}
                    </Button>
                </form>

                {invalidExample && (
                    <Notice status="warning" isDismissible={false}>
                        {`"${input}" ${__('is not a valid token.', 'costered-blocks')} ${tokenPattern.toString()}`}
                    </Notice>
                )}

                <div className="costered-token-grid__rows" style={{ display: 'grid', gap: '8px' }}>
                    {rows.map((row, rowIndex) => (
                        <div key={`row-${rowIndex}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Flex style={{ flexWrap: 'wrap', gap: '6px', flex: 1, border: '1px solid var(--wp-components-color-gray-300, #ddd)', padding: '6px', borderRadius: '6px' }}>
                                {row.map((token, tokenIndex) => (
                                    <FlexItem key={`t-${rowIndex}-${tokenIndex}`}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', border: '1px solid #c3c4c7', borderRadius: '999px' }}>
                                            <TextControl
                                                __next40pxDefaultSize
                                                __nextHasNoMarginBottom
                                                hideLabelFromVision
                                                label={inputLabel}
                                                value={token}
                                                onChange={(v) => replaceToken(rowIndex, tokenIndex, v)}
                                                style={{ width: '12ch' }}
                                            />
                                            <Tooltip text={__('Remove token', 'costered-blocks')}>
                                                <Button
                                                    icon={trash}
                                                    variant="tertiary"
                                                    onClick={() => removeToken(rowIndex, tokenIndex)}
                                                    aria-label={__('Remove token', 'costered-blocks')}
                                                />
                                            </Tooltip>
                                        </div>
                                    </FlexItem>
                                ))}

                                <FlexItem>
                                    <Tooltip text={addTokenAria}>
                                        <Button
                                            icon={plus}
                                            variant="secondary"
                                            onClick={() => addToken(rowIndex, input || placeholderToken)}
                                            aria-label={addTokenAria}
                                        />
                                    </Tooltip>
                                </FlexItem>
                            </Flex>

                            <div style={{ display: 'flex', gap: '4px' }}>
                                <Tooltip text={__('Move row up', 'costered-blocks')}>
                                    <Button icon={arrowUp} variant="tertiary" onClick={() => moveRow(rowIndex, -1)} />
                                </Tooltip>
                                <Tooltip text={__('Move row down', 'costered-blocks')}>
                                    <Button icon={arrowDown} variant="tertiary" onClick={() => moveRow(rowIndex, 1)} />
                                </Tooltip>
                                <Tooltip text={rows.length <= minRows ? __('Minimum rows reached', 'costered-blocks') : __('Remove row', 'costered-blocks')}>
                                    <Button
                                        icon={trash}
                                        variant="secondary"
                                        onClick={() => removeRow(rowIndex)}
                                        disabled={rows.length <= minRows}
                                    />
                                </Tooltip>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}