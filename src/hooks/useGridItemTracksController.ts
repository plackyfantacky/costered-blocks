// chugga chugga choo choo chugga chugga 🚂
import { useState, useEffect, useMemo, useCallback } from '@wordpress/element';
import { useAttrGetter, useGridItemWriter } from '@hooks';
import type { ParentMeta } from '@types';

import {
    clamp, isIntToken, toInt, parsePlacementAdvanced, extractNamedLines,
    toSignedLine, parseSigned, isGridPlacement, composePlacementAdvanced
} from '@utils/gridPlacement';

const MAX_INT = Number.MAX_SAFE_INTEGER;

type Mode = 'span' | 'end';

type Props = {
    clientId: string;
    setMany: (partial: Record<string, any>) => void;
    parentMeta: ParentMeta;
}

export function useGridItemTracksController({ clientId, setMany, parentMeta }: Props) {
    if (!clientId) return null;

    const { get } = useAttrGetter(clientId);
    const { writeColumn, writeRow } = useGridItemWriter(clientId);

    const hasArea = isGridPlacement(get('gridArea'));
    const columnsCount = parentMeta?.columns ?? 0;
    const rowsCount = parentMeta?.rows ?? 0;

    const col = useMemo(() => parsePlacementAdvanced(get('gridColumn')), [get]);
    const row = useMemo(() => parsePlacementAdvanced(get('gridRow')), [get]);

    const inferColMode: Mode = col.end ? 'end' : 'span';
    const inferRowMode: Mode = row.end ? 'end' : 'span';

    const [colMode, setColMode] = useState<Mode>(inferColMode);
    const [rowMode, setRowMode] = useState<Mode>(inferRowMode);

    useEffect(() => { setColMode(inferColMode); }, [inferColMode]);
    useEffect(() => { setRowMode(inferRowMode); }, [inferRowMode]);

    // Named line suggestions from parent
    const namedColLines = useMemo(() => extractNamedLines(parentMeta.columnTemplate), [parentMeta.columnTemplate]);
    const namedRowLines = useMemo(() => extractNamedLines(parentMeta.rowTemplate), [parentMeta.rowTemplate]);
    const hasNamedColLines = namedColLines.length > 0;
    const hasNamedRowLines = namedRowLines.length > 0;

    // Mode inference for inputs
    const startMode = (token: unknown, hasNames: boolean) => 
        hasNames ? (isIntToken(token) ? 'number' : 'named') : 'number';

    const endModeInferred = (token: unknown) => 
        token ? (isIntToken(token) ? 'number' : (token === 'auto' ? 'auto' : 'named')) : 'number';

    const endModeUI = (token: unknown, hasNames: boolean) => {
        const mode = endModeInferred(token);
        return hasNames ? mode : (mode === 'named' ? 'number' : mode);
    };

    const colStartModeUI = startMode(col.start, hasNamedColLines);
    const rowStartModeUI = startMode(row.start, hasNamedRowLines);
    const colEndModeUI = endModeUI(col.end, hasNamedColLines);
    const rowEndModeUI = endModeUI(row.end, hasNamedRowLines);

    // Span caps based on parent size and start position
    const colSpanCap = useMemo(() => {
        if (!columnsCount || !isIntToken(col.start)) return MAX_INT;
        const start = clamp(toInt(col.start, 1), 1, columnsCount);
        return Math.max(1, columnsCount - start + 1);
    }, [columnsCount, col.start]);

    const rowSpanCap = useMemo(() => {
        if (!rowsCount || !isIntToken(row.start)) return MAX_INT;
        const start = clamp(toInt(row.start, 1), 1, rowsCount);
        return Math.max(1, rowsCount - start + 1);
    }, [rowsCount, row.start]);

    // Drafts for "0 is invalid" inputs    
    const [colEndDraft, setColEndDraft] = useState<number | '' | null>(null);
    const [rowEndDraft, setRowEndDraft] = useState<number | '' | null>(null);
    useEffect(() => { setColEndDraft(null); }, [get('gridColumn')]);
    useEffect(() => { setRowEndDraft(null); }, [get('gridRow')]);

    //collumn handlers
    const onColStartNumber = useCallback((value: unknown) => {
        const start = toInt(value, 1);
        if (col.end) writeColumn(colMode, { start, end: col.end });
        else writeColumn(colMode, { start, span: clamp(toInt(col.span, 1), 1, colSpanCap) });
    }, [col.end, col.span, colSpanCap, writeColumn]);

    const onColStartNamed = useCallback((value: unknown) => {
        const start = String(value || 'auto').trim() || 'auto';
        if (col.end) writeColumn(colMode, { start, end: col.end });
        else writeColumn(colMode, { start, span: toInt(col.span, 1) });
    }, [col.end, col.span, writeColumn]);

    const onColSpan = useCallback((value: unknown) => {
        const span = clamp(toInt(value, 1), 1, colSpanCap);
        writeColumn(colMode, { start: col.start || 'auto', span });
    }, [col.start, colSpanCap, writeColumn]);

    const onColEndNumber = useCallback((value: unknown) => {
        const num = toInt(value, 0);
        setColEndDraft(num);
        if (value === 0) return; // don’t write invalid 0; show notice
        writeColumn(colMode, { start: col.start || 'auto', end: toSignedLine(value, 1) });
        setColEndDraft(null);
    }, [col.start, writeColumn]);

    const onColEndNamed = useCallback((value: unknown) => {
        writeColumn(colMode, { start: col.start || 'auto', end: String(value || 'auto').trim() || 'auto' });
    }, [col.start, writeColumn]);

    const onColEndAuto = useCallback(() => {
        writeColumn(colMode, { start: col.start || 'auto', end: 'auto' });
    }, [col.start, writeColumn]);

    //row handlers

    const onRowStartNumber = useCallback((value: unknown) => {
        const start = toInt(value, 1);
        if (row.end) writeRow(rowMode, { start, end: row.end });
        else writeRow(rowMode, { start, span: clamp(toInt(row.span, 1), 1, rowSpanCap) });
    }, [row.end, row.span, rowSpanCap, writeRow]);

    const onRowStartNamed = useCallback((value: unknown) => {
        const start = String(value || 'auto').trim() || 'auto';
        if (row.end) writeRow(rowMode, { start, end: row.end });
        else writeRow(rowMode, { start, span: toInt(row.span, 1) });
    }, [row.end, row.span, rowMode, writeRow]);

    const onRowSpan = useCallback((value: unknown) => {
        const span = clamp(toInt(value, 1), 1, rowSpanCap);
        writeRow(rowMode, { start: row.start || 'auto', span });
    }, [row.start, rowSpanCap, writeRow]);

    const onRowEndNumber = useCallback((value: unknown) => {
        const num = toInt(value, 0);
        setRowEndDraft(num);
        if (value === 0) return; // don’t write invalid 0; show notice
        writeRow(rowMode, { start: row.start || 'auto', end: toSignedLine(value, 1) });
        setRowEndDraft(null);
    }, [row.start, rowMode, writeRow]);

    const onRowEndNamed = useCallback((value: unknown) => {
        writeRow(rowMode, { start: row.start || 'auto', end: String(value || 'auto').trim() || 'auto' });
    }, [row.start, rowMode, writeRow]);

    const onRowEndAuto = useCallback(() => {
        writeRow(rowMode, { start: row.start || 'auto', end: 'auto' });
    }, [row.start, rowMode, writeRow]);

    // disable if using grid-area
    const disabledLines = hasArea;

    return {
        hasArea,
        disabledLines,
        numbers: { isIntToken, toInt, parseSigned },
        column: {
            values: { ...col },
            modes: {
                uiStart: (hasNamedColLines ? (isIntToken(col.start) ? 'number' : 'named') : 'number'),
                uiEnd: (col.end ? (isIntToken(col.end) ? 'number' : (String(col.end) === 'auto' ? 'auto' : 'named')) : 'number'),
                mode: colMode,
            },
            setMode: setColMode,
            named: { lines: namedColLines, hasLines: hasNamedColLines },
            caps: { span: colSpanCap },
            drafts: { end: colEndDraft, setEnd: setColEndDraft },
            handlers: {
                onStartNumber: onColStartNumber,
                onStartNamed: onColStartNamed,
                onSpan: onColSpan,
                onEndNumber: onColEndNumber,
                onEndNamed: onColEndNamed,
                onEndAuto: onColEndAuto,
            }
        },
        row: {
            values: { ...row },
            modes: {
                uiStart: (hasNamedRowLines ? (isIntToken(row.start) ? 'number' : 'named') : 'number'),
                uiEnd: (row.end ? (isIntToken(row.end) ? 'number' : (String(row.end) === 'auto' ? 'auto' : 'named')) : 'number'),
                mode: rowMode,
            },
            setMode: setRowMode,
            named: { lines: namedRowLines, hasLines: hasNamedRowLines },
            caps: { span: rowSpanCap },
            drafts: { end: rowEndDraft, setEnd: setRowEndDraft },
            handlers: {
                onStartNumber: onRowStartNumber,
                onStartNamed: onRowStartNamed,
                onSpan: onRowSpan,
                onEndNumber: onRowEndNumber,
                onEndNamed: onRowEndNamed,
                onEndAuto: onRowEndAuto,
            }
        }
    }
}
