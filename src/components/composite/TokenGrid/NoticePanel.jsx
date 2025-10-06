import { __, sprintf } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';
import { useState, useCallback } from "@wordpress/element";

import {
    Button, Notice, Flex, FlexBlock,
    __experimentalConfirmDialog as ConfirmDialog,
    __experimentalHeading as Heading
} from '@wordpress/components';

import { extendTrackTemplate, shrinkTrackTemplate } from '@utils/gridUtils';
import { useAttrSetter, useGridStoreAreasIO, useGridModel } from '@hooks';
import { LABELS as DEFAULT_LABELS } from "@labels";
import { DEFAULT_GRID_UNIT } from '@config';

export function NoticePanel({ clientId, columnData, rowData, gridMatrix: { resize }, labels = DEFAULT_LABELS.tokenGridNotice }) {

    const { updateBlockAttributes } = useDispatch('core/block-editor');
    const { set } = useAttrSetter(updateBlockAttributes, clientId);

    const { trackColumnCount, trackRowCount } = useGridStoreAreasIO(clientId);
    const model = useGridModel(clientId);

    // ConfirmDialog state
    const [isConfirmOpen, setConfirmOpen] = useState(false);

    const asCount = (v) => (v && typeof v === 'object' ? (v.count ?? 0) : (Number(v) || 0));
    const asUnit = (v, fallback) => (v && typeof v === 'object' && v.unit) ? v.unit : fallback;

    // Normalised sizes
    const areaCols = Number(columnData) || 0;
    const areaRows = Number(rowData) || 0;
    const trackCols = asCount(trackColumnCount);
    const trackRows = asCount(trackRowCount);
    const colUnit = asUnit(trackColumnCount, DEFAULT_GRID_UNIT); // e.g. '1fr'
    const rowUnit = asUnit(trackRowCount, 'auto');

    const columnsMismatch = areaCols !== trackCols;
    const rowsMismatch = areaRows !== trackRows;
    const canShrinkTracks = areaCols < trackCols || areaRows < trackRows;

    const resizeAreasToTracks = useCallback(() => {
        const targetCols = trackCols || areaCols || 1;
        const targetRows = trackRows || areaRows || 1;
        resize(targetCols, targetRows);
    }, [resize, trackCols, trackRows, areaCols, areaRows]);

    // need-to-grow flags
    const needGrowCols = areaCols > trackCols;
    const needGrowRows = areaRows > trackRows;

    const growTracksToAreas = useCallback(() => {
        const curCols = model?.columns?.template ?? '';
        const curRows = model?.rows?.template ?? '';

        const nextColumns = needGrowCols
            ? extendTrackTemplate(curCols, areaCols, colUnit)
            : curCols;

        const nextRows = needGrowRows
            ? extendTrackTemplate(curRows, areaRows, rowUnit)
            : curRows;

        // Optional: bail if nothing changes
        if (nextColumns === curCols && nextRows === curRows) {
            // console.debug('[Grid] grow: no-op', { curCols, curRows, areaCols, areaRows, trackCols, trackRows });
            return;
        }

        set('gridTemplateColumns', nextColumns);
        set('gridTemplateRows', nextRows);
    }, [areaCols, areaRows, colUnit, rowUnit, model, set]);

    const performShrink = useCallback(() => {
        const nextColumns = shrinkTrackTemplate(model?.columns?.template ?? '', areaCols);
        const nextRows = shrinkTrackTemplate(model?.rows?.template ?? '', areaRows);
        set('gridTemplateColumns', nextColumns);
        set('gridTemplateRows', nextRows);
    }, [areaCols, areaRows, model, set]);

    const requestShrink = useCallback(() => {
        const hasLineNames =
            /\[[^\]]+]/.test(model?.columns?.template ?? '') ||
            /\[[^\]]+]/.test(model?.rows?.template ?? '');

        if (hasLineNames) {
            setConfirmOpen(true);
        } else {
            performShrink();
        }
    }, [model, performShrink]);

    if (!columnsMismatch && !rowsMismatch) return null;

    return (
        <Flex direction="column" gap={2} className="costered-blocks--grid-area-notices">
            <Notice status="info" isDismissible={false}>
                {sprintf(labels.mismatchText, areaCols, areaRows, trackCols, trackRows)}
                <Flex direction="column" gap={2} style={{ marginTop: 8 }}>
                    <FlexBlock>
                        <Button variant="secondary" onClick={resizeAreasToTracks}>{labels.resizeToTracks}</Button>
                    </FlexBlock>
                    {(needGrowCols || needGrowRows) && (
                        <FlexBlock>
                            <Button variant="secondary" onClick={growTracksToAreas} disabled={!needGrowCols && !needGrowRows}>{labels.growTracksToAreas}</Button>
                        </FlexBlock>
                    )}
                    {canShrinkTracks && (
                        <FlexBlock>
                            <Button variant="secondary" isDestructive onClick={requestShrink}>{labels.shrinkTracks.button}</Button>
                        </FlexBlock>
                    )}
                </Flex>
            </Notice>
            {canShrinkTracks && (
                <Notice status="warning" isDismissible={false} className="costered-blocks--grid-area-notice--shrink-warning">
                    <span>{labels.shrinkTracks.warning}</span>
                </Notice>
            )}
            <ConfirmDialog
                isOpen={isConfirmOpen}
                onConfirm={() => { performShrink(); setConfirmOpen(false); }}
                onCancel={() => setConfirmOpen(false)}
                confirmButtonText={labels.shrinkTracks.confirm}
                cancelButtonText={labels.shrinkTracks.cancel}>
                <Heading>{labels.shrinkTracks.heading}</Heading>
                <p>{labels.shrinkTracks.description}</p>
            </ConfirmDialog>
        </Flex>
    );
}