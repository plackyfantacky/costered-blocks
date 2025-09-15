// chugga chugga choo choo chugga chugga 🚂
import { useState, useEffect, useMemo, useCallback } from '@wordpress/element';

import { useGridItemWriter } from '@hooks';
import {
    clamp, isIntToken, toInt, parsePlacementAdvanced, extractNamedLines,
    toSignedLine, parseSigned, isGridPlacement
} from '@utils/gridPlacement';

const maxInteger = Number.MAX_SAFE_INTEGER;

export function useGridItemTracksController({ attributes, setMany, parentMeta }) {
    const hasArea = isGridPlacement(attributes.gridArea);
    const { columns, rows, columnTemplate, rowTemplate } = parentMeta;

    //parse the current values
    const col = useMemo(() => parsePlacementAdvanced(attributes.gridColumn), [attributes.gridColumn]);
    const row = useMemo(() => parsePlacementAdvanced(attributes.gridRow), [attributes.gridRow]);

    //UI mode state (decoupled from attribute value)
    //if the attribute changes externally, update the mode
    const inferColMode = col.end ? 'end' : 'span';
    const inferRowMode = row.end ? 'end' : 'span';
    const [colMode, setColMode] = useState(inferColMode);
    const [rowMode, setRowMode] = useState(inferRowMode);
    useEffect(() => { setColMode(inferColMode); }, [inferColMode]);
    useEffect(() => { setRowMode(inferRowMode); }, [inferRowMode]);

    // Writers (generic)
    const writeColumn = useGridItemWriter(setMany, 'gridColumn', colMode);
    const writeRow = useGridItemWriter(setMany, 'gridRow', rowMode);

    // Named line suggestions from parent
    const namedColLines = useMemo(() => extractNamedLines(columnTemplate), [columnTemplate]);
    const namedRowLines = useMemo(() => extractNamedLines(rowTemplate), [rowTemplate]);
    const hasNamedColLines = namedColLines.length > 0;
    const hasNamedRowLines = namedRowLines.length > 0;

    // Mode inference for inputs
    const startMode = (token, hasNames) => (hasNames ? (isIntToken(token) ? 'number' : 'named') : 'number');
    const endModeInferred = (token) => token ? (isIntToken(token) ? 'number' : (token === 'auto' ? 'auto' : 'named')) : 'number';
    const endModeUI = (token, hasNames) => {
        const mode = endModeInferred(token);
        return hasNames ? mode : (mode === 'named' ? 'number' : mode);
    };

    const colStartModeUI = startMode(col.start, hasNamedColLines);
    const rowStartModeUI = startMode(row.start, hasNamedRowLines);
    const colEndModeUI = endModeUI(col.end, hasNamedColLines);
    const rowEndModeUI = endModeUI(row.end, hasNamedRowLines);

    // Span caps based on parent size and start position
    const colSpanCap = useMemo(() => {
        if (!columns || !isIntToken(col.start)) return maxInteger;
        const start = clamp(toInt(col.start, 1), 1, columns);
        return Math.max(1, columns - start + 1);
    }, [columns, col.start]);

    const rowSpanCap = useMemo(() => {
        if (!rows || !isIntToken(row.start)) return maxInteger;
        const start = clamp(toInt(row.start, 1), 1, rows);
        return Math.max(1, rows - start + 1);
    }, [rows, row.start]);

    // Drafts for "0 is invalid" inputs    
    const [colEndDraft, setColEndDraft] = useState(null); // number | '' | null;
    const [rowEndDraft, setRowEndDraft] = useState(null); // number | '' | null;
    useEffect(() => { setColEndDraft(null); }, [attributes.gridColumn]);
    useEffect(() => { setRowEndDraft(null); }, [attributes.gridRow]);

    //collumn handlers
    const onColStartNumber = useCallback((value) => {
        const start = toInt(value, 1);
        if (col.end) writeColumn({ start, end: col.end });
        else writeColumn({ start, span: clamp(toInt(col.span, 1), 1, colSpanCap) });
    }, [col.end, col.span, colSpanCap, writeColumn]);

    const onColStartNamed = useCallback((value) => {
        const start = String(value || 'auto').trim() || 'auto';
        if (col.end) writeColumn({ start, end: col.end });
        else writeColumn({ start, span: toInt(col.span, 1) });
    }, [col.end, col.span, writeColumn]);

    const onColSpan = useCallback((value) => {
        const span = clamp(toInt(value, 1), 1, colSpanCap);
        writeColumn({ start: col.start || 'auto', span });
    }, [col.start, colSpanCap, writeColumn]);

    const onColEndNumber = useCallback((value) => {
        setColEndDraft(value);
        if (value === 0) return; // don’t write invalid 0; show notice
        writeColumn({ start: col.start || 'auto', end: toSignedLine(value, 1) });
        setColEndDraft(null);
    }, [col.start, writeColumn]);

    const onColEndNamed = useCallback((value) => {
        writeColumn({ start: col.start || 'auto', end: String(value || 'auto').trim() || 'auto' });
    }, [col.start, writeColumn]);

    const onColEndAuto = useCallback(() => {
        writeColumn({ start: col.start || 'auto', end: 'auto' });
    }, [col.start, writeColumn]);

    //row handlers

    const onRowStartNumber = useCallback((value) => {
        const start = toInt(value, 1);
        if (row.end) writeRow({ start, end: row.end });
        else writeRow({ start, span: clamp(toInt(row.span, 1), 1, rowSpanCap) });
    }, [row.end, row.span, rowSpanCap, writeRow]);

    const onRowStartNamed = useCallback((value) => {
        const start = String(value || 'auto').trim() || 'auto';
        if (row.end) writeRow({ start, end: row.end });
        else writeRow({ start, span: toInt(row.span, 1) });
    }, [row.end, row.span, writeRow]);

    const onRowSpan = useCallback((value) => {
        const span = clamp(toInt(value, 1), 1, rowSpanCap);
        writeRow({ start: row.start || 'auto', span });
    }, [row.start, rowSpanCap, writeRow]);

    const onRowEndNumber = useCallback((value) => {
        setRowEndDraft(value);
        if (value === 0) return; // don’t write invalid 0; show notice
        writeRow({ start: row.start || 'auto', end: toSignedLine(value, 1) });
        setRowEndDraft(null);
    }, [row.start, writeRow]);

    const onRowEndNamed = useCallback((value) => {
        writeRow({ start: row.start || 'auto', end: String(value || 'auto').trim() || 'auto' });
    }, [row.start, writeRow]);

    const onRowEndAuto = useCallback(() => {
        writeRow({ start: row.start || 'auto', end: 'auto' });
    }, [row.start, writeRow]);

    // disable if using grid-area
    const disabledLines = hasArea;

    return {
        hasArea,
        disabledLines,
        numbers: { isIntToken, toInt, parseSigned },
        column: {
            values: { ...col },
            modes: {
                uiStart: colStartModeUI,
                uiEnd: colEndModeUI,
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
                uiStart: rowStartModeUI,
                uiEnd: rowEndModeUI,
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
