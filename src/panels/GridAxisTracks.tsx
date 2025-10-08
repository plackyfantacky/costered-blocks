import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { Flex, FlexBlock } from '@wordpress/components';

import { useAttrSetter, useGridModel } from '@hooks';
import { normaliseTemplate } from '@utils/gridUtils';
import { LABELS } from '@labels';
import type { GridAxisModel, GridModel } from '@types';

import { GridAxisAside } from "@components/composite/GridAxisAside";
import { TokenEditor } from '@components/composite/TokenEditor';

type Props = {
    clientId: string | null;
    axisDisabled?: { columns?: boolean; rows?: boolean };
};

export function GridAxisTracks({ 
    clientId,
    axisDisabled
 }: Props) {
    if (!clientId) return null;

    const { set, unset } = useAttrSetter(clientId ?? null);

    const model = (useGridModel(clientId) as GridModel | null) ?? null;
    const col = (model?.columns ?? null) as GridAxisModel | null;
    const row = (model?.rows ?? null) as GridAxisModel | null;

    // Seed tokens: prefer decoder tokens; else fallback to raw template as one token; else empty
    const seedCols = useMemo<string[]>(() => {
        if (!col) return [];
        if (Array.isArray(col.tracks) && col.tracks.length) return [...col.tracks];
        if (col.template) return [String(col.template)];
        return [];
    }, [col?.tracks, col?.template]);

    const seedRows = useMemo<string[]>(() => {
        if (!row) return [];
        if (Array.isArray(row.tracks) && row.tracks.length) return [...row.tracks];
        if (row.template) return [String(row.template)];
        return [];
    }, [row?.tracks, row?.template]);

    const [colTokens, setColTokens] = useState<string[]>(seedCols);
    const [rowTokens, setRowTokens] = useState<string[]>(seedRows);

    // Resynchronise when underlying template meaningfully changes
    const colKey = (col && (col.normalised ?? normaliseTemplate(col.template ?? ''))) ?? '';
    const rowKey = (row && (row.normalised ?? normaliseTemplate(row.template ?? ''))) ?? '';

    useEffect(() => { setColTokens(seedCols); }, [colKey, seedCols]);
    useEffect(() => { setRowTokens(seedRows); }, [rowKey, seedRows]);

    // Serialisers
    const serialise = useCallback((tokens: readonly string[]): string | null => {
        const cleaned = tokens.map((token) => String(token ?? '').trim()).filter(Boolean);
        return cleaned.length ? cleaned.join(' ') : null;
    }, []);

    const writeCols = useCallback((tokens: readonly string[]) => {
        const template = serialise(tokens);
        template == null ? unset('gridTemplateColumns') : set('gridTemplateColumns', template);
    }, [serialise, set, unset]);

    const writeRows = useCallback((tokens: readonly string[]) => {
        const template = serialise(tokens);
        template == null ? unset('gridTemplateRows') : set('gridTemplateRows', template);
    }, [serialise, set, unset]);

    // Active indicators
    // const colsActive = useMemo(() => {
    //     const now = serialise(colTokens);
    //     return !!col?.template && normaliseTemplate(now ?? '') === colKey;
    // }, [col?.template, colKey, colTokens, serialise]);

    // const rowsActive = useMemo(() => {
    //     const now = serialise(rowTokens);
    //     return !!row?.template && normaliseTemplate(now ?? '') === rowKey;
    // }, [row?.template, rowKey, rowTokens, serialise]);

    // Handlers for token lists
    const addToken = useCallback((
        tokens: readonly string[],
        setTokens: (next: string[]) => void,
        write: (next: readonly string[]) => void,
        value: string
    ) => {
        const val = String(value ?? '').trim();
        if (!val) return;
        const next = [...tokens, val];
        setTokens(next);
        write(next);
    }, []);

    const updateToken = useCallback((
        tokens: readonly string[],
        setTokens: (next: string[]) => void,
        write: (next: readonly string[]) => void,
        index: number,
        value: string
    ) => {
        if (index < 0 || index >= tokens.length) return;
        const next = tokens.slice() as string[];
        next[index] = String(value ?? '').trim();
        setTokens(next);
        write(next);
    }, []);

    const removeToken = useCallback((
        tokens: readonly string[], 
        setTokens: (next: string[]) => void,
        write: (next: readonly string[]) => void,
        index: number
    ) => {
        if (index < 0 || index >= tokens.length) return;
        const next = tokens.slice() as string[];
        next.splice(index, 1);
        setTokens(next);
        write(next);
    }, []);

    const moveToken = useCallback((
        tokens: readonly string[],
        setTokens: (next: string[]) => void,
        write: (next: readonly string[]) => void,
        from: number, 
        direction: number
    ) => {
        const to = from + direction;
        if (to < 0 || to >= tokens.length || from < 0 || from >= tokens.length) return;
        const next = tokens.slice() as string[];
        const t = next.splice(from, 1)[0]!;
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

    const colDisabled = !!axisDisabled?.columns;
    const rowDisabled = !!axisDisabled?.rows;

    const ownerCols: string | null = (model?.activePane?.columns ?? null) as string | null;
    const ownerRows: string | null = (model?.activePane?.rows ?? null) as string | null;

    return (
        <Flex direction="column" gap={6}>
            <FlexBlock>
                {LABELS.gridControls.tracksPanel.description}
            </FlexBlock>
            <FlexBlock>
                <Flex direction="column" gap={3} className={"costered-blocks--grid-panel-tracks--axis-controls"}>
                    <Flex direction="row" justify="space-between" align="center">
                        <span className="costered-blocks--grid-panel-tracks--axis-label">{LABELS.gridControls.tracksPanel.columns.label}</span>
                        <GridAxisAside
                            axis="columns"
                            canClear={!!col?.template}
                            onClear={clearCols}
                            owner={ownerCols}
                            here="tracks"
                            label={LABELS.gridControls.tracksPanel.columns.clear}
                        />
                    </Flex>
                    <TokenEditor
                        tokens={colTokens}
                        onAdd={(value) => addToken(colTokens, setColTokens, writeCols, value)}
                        onEdit={(index, value) => updateToken(colTokens, setColTokens, writeCols, index, value)}
                        onRemove={(index) => removeToken(colTokens, setColTokens, writeCols, index)}
                        onMove={(index, direction) => moveToken(colTokens, setColTokens, writeCols, index, direction)}
                        labels={{
                            addPlaceholder: LABELS.gridControls.tracksPanel.columns.addPlaceholder,
                            addToken: LABELS.gridControls.tracksPanel.columns.addToken,
                            addLabel: LABELS.gridControls.tracksPanel.columns.addLabel
                        }}
                    />
                </Flex>
            </FlexBlock>
            <FlexBlock>
                <Flex direction="column" gap={3} className={"costered-blocks--grid-panel-tracks--axis-controls"}>
                    <Flex direction="row" gap={2} justify="space-between" align="center">
                        <FlexBlock>
                            <span className="costered-blocks--grid-panel-tracks--axis-label">{LABELS.gridControls.tracksPanel.rows.label}</span>
                        </FlexBlock>
                        <GridAxisAside
                            axis="rows"
                            canClear={!!row?.template}
                            onClear={clearRows}
                            owner={ownerRows}
                            here="tracks"
                            label={LABELS.gridControls.tracksPanel.rows.clear}
                        />
                    </Flex>
                    <TokenEditor
                        tokens={rowTokens}
                        onAdd={(value) => addToken(rowTokens, setRowTokens, writeRows, value)}
                        onEdit={(index, value) => updateToken(rowTokens, setRowTokens, writeRows, index, value)}
                        onRemove={(index) => removeToken(rowTokens, setRowTokens, writeRows, index)}
                        onMove={(index, direction) => moveToken(rowTokens, setRowTokens, writeRows, index, direction)}
                        labels={{
                            addPlaceholder: LABELS.gridControls.tracksPanel.rows.addPlaceholder,
                            addToken: LABELS.gridControls.tracksPanel.rows.addToken,
                            addLabel: LABELS.gridControls.tracksPanel.rows.addLabel
                        }}
                    />
                </Flex>
            </FlexBlock>
        </Flex>
    );
}