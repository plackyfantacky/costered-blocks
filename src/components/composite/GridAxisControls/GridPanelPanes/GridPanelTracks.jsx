import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { Flex, FlexBlock, FlexItem, TextControl, Button, Tooltip } from '@wordpress/components';

import { useAttrSetter, useGridModel } from '@hooks';
import { splitTopLevel, normaliseTemplate } from '@utils/gridPanelUtils';
import { AxisAside } from "@components/composite/GridAxisControls/AxisAside";
import { TokenEditor } from '@components/composite/TokenEditor';

export function GridPanelTracks({ clientId }) {
    if (!clientId) return null;
    const { updateBlockAttributes } = useDispatch('core/block-editor');
    const { set, unset } = useAttrSetter(updateBlockAttributes, clientId);
    
    const model = useGridModel(clientId);
    const col = model?.columns;
    const row = model?.rows;

    // Seed tokens: prefer decoder tokens; else fallback to raw template as one token; else empty
    const seedCols = useMemo(() => {
        if (!col) return [];
        if (col.tracks?.length) return col.tracks;
        if (col.template) return [String(col.template)];
        return [];
    }, [col]);

    const seedRows = useMemo(() => {
        if (!row) return [];
        if (row.tracks?.length) return row.tracks;
        if (row.template) return [String(row.template)];
        return [];
    }, [row]);

    const [colTokens, setColTokens] = useState(seedCols);
    const [rowTokens, setRowTokens] = useState(seedRows);

    // Resynchronise when underlying template meaningfully changes
    const colKey = (col && (col.normalised ?? normaliseTemplate(col.template || ''))) || '';
    const rowKey = (row && (row.normalised ?? normaliseTemplate(row.template || ''))) || '';

    useEffect(() => { setColTokens(seedCols); }, [colKey]);
    useEffect(() => { setRowTokens(seedRows); }, [rowKey]);

     // Serialisers
    const serialise = useCallback((tokens) => {
        const cleaned = tokens.map((t) => String(t || '').trim()).filter(Boolean);
        return cleaned.length ? cleaned.join(' ') : null;
    }, []);

    const writeCols = useCallback((tokens) => {
        const template = serialise(tokens);
        template == null ? unset('gridTemplateColumns') : set('gridTemplateColumns', template);
    }, [serialise, set, unset]);

    const writeRows = useCallback((tokens) => {
        const template = serialise(tokens);
        template == null ? unset('gridTemplateRows') : set('gridTemplateRows', template);
    }, [serialise, set, unset]);

    // Active indicators
    const colsActive = useMemo(() => {
        const now = serialise(colTokens);
        return !!col?.template && normaliseTemplate(now || '') === colKey;
    }, [col?.template, colKey, colTokens, serialise]);

    const rowsActive = useMemo(() => {
        const now = serialise(rowTokens);
        return !!row?.template && normaliseTemplate(now || '') === rowKey;
    }, [row?.template, rowKey, rowTokens, serialise]);

    // Handlers for token lists
    const addToken = useCallback((tokens, setTokens, write, value) => {
        const v = String(value || '').trim();
        if (!v) return;
        const next = [...tokens, v];
        setTokens(next);
        write(next);
    }, []);

    const updateToken = useCallback((tokens, setTokens, write, index, value) => {
        const next = tokens.slice();
        next[index] = value;
        setTokens(next);
        write(next);
    }, []);

    const removeToken = useCallback((tokens, setTokens, write, index) => {
        const next = tokens.slice();
        next.splice(index, 1);
        setTokens(next);
        write(next);
    }, []);

    const moveToken = useCallback((tokens, setTokens, write, from, direction) => {
        const to = from + direction;
        if (to < 0 || to >= tokens.length) return;
        const next = tokens.slice();
        const t = next.splice(from, 1)[0];
        next.splice(to, 0, t);
        setTokens(next);
        write(next);
    }, []);

    // Clear
    const clearCols = useCallback(() => {
        setColTokens([]);
        unset('gridTemplateColumns');
    }, [unset]);

    const clearRows = useCallback(() => {
        setRowTokens([]);
        unset('gridTemplateRows');
    }, [unset]);

    return (
        <Flex direction="column" gap={4}>
            <FlexBlock>
                {__('In Tracks mode, you can define the exact track sizes using any valid CSS Grid value.', 'costered-blocks')}
            </FlexBlock>
            <FlexBlock>
                <Flex direction="column" gap={1}>
                    <FlexItem>
                        <Flex direction="row" gap={2} justify="space-between" align="center">
                            <FlexBlock>
                                <span className="costered-blocks--grid-panel-tracks-label">{__('Columns', 'costered-blocks')}</span>
                            </FlexBlock>
                            <FlexItem style={{ width: 32, flex: '0 0 32px' }}>
                                <AxisAside
                                    axis="columns"
                                    canClear={!!col?.template}
                                    onClear={clearCols}
                                    owner={model.activePane.columns}
                                    here="tracks"
                                />
                            </FlexItem>
                        </Flex>
                    </FlexItem>
                    <FlexBlock>
                        <Flex direction="column" gap={2} className="costered-axis-body">
                            <TokenEditor
                                tokens={colTokens}
                                setTokens={setColTokens}
                                onAdd={(value) => addToken(colTokens, setColTokens, writeCols, value)}
                                onEdit={(index, value) => updateToken(colTokens, setColTokens, writeCols, index, value)}
                                onRemove={(index) => removeToken(colTokens, setColTokens, writeCols, index)}
                                onMove={(index, direction) => moveToken(colTokens, setColTokens, writeCols, index, direction)}
                                labels={{
                                    placeholder: __('Add track (e.g. 240px or minmax(10ch, 2fr))', 'costered-blocks'),
                                    addPlaceholder: __('Add track or [line names]', 'costered-blocks')
                                }}
                            />
                        </Flex>
                    </FlexBlock>     
                </Flex>
            </FlexBlock>
            <FlexBlock>
                <Flex direction="column" gap={1}>
                    <FlexItem>
                        <Flex direction="row" gap={2} justify="space-between" align="center">
                            <FlexBlock>
                                <span className="costered-blocks--grid-panel-tracks-label">{__('Rows', 'costered-blocks')}</span>
                            </FlexBlock>
                            <FlexItem style={{ width: 32, flex: '0 0 32px' }}>
                                <AxisAside
                                    axis="rows"
                                    canClear={!!row?.template}
                                    onClear={clearRows}
                                    owner={model.activePane.rows}
                                    here="tracks"
                                />
                            </FlexItem>
                        </Flex>
                    </FlexItem>
                    <FlexBlock>
                        <Flex direction="column" gap={2} className="costered-axis-body">
                            <TokenEditor
                                tokens={rowTokens}
                                setTokens={setRowTokens}
                                onAdd={(value) => addToken(rowTokens, setRowTokens, writeRows, value)}
                                onEdit={(index, value) => updateToken(rowTokens, setRowTokens, writeRows, index, value)}
                                onRemove={(index) => removeToken(rowTokens, setRowTokens, writeRows, index)}
                                onMove={(index, direction) => moveToken(rowTokens, setRowTokens, writeRows, index, direction)}
                                labels={{
                                    placeholder: __('Add track (e.g. 240px or minmax(10ch, 2fr))', 'costered-blocks'),
                                    addPlaceholder: __('Add track or [line names]', 'costered-blocks')
                                }}
                            />
                        </Flex>
                    </FlexBlock>     
                </Flex>
            </FlexBlock>
        </Flex>
    );
}