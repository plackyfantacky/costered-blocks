import { sprintf } from '@wordpress/i18n';
import { useState, useCallback, useEffect } from "@wordpress/element";

import {
    Button, 
    Notice, 
    Flex, 
    FlexBlock,
    __experimentalConfirmDialog as ConfirmDialog,
    __experimentalHeading as Heading
} from '@wordpress/components';

import { 
    countTracks, 
    extendTrackTemplate, 
    shrinkTrackTemplate, 
    toCount
 } from '@utils/gridUtils';
import { useAttrSetter, useGridModel } from '@hooks';
import { LABELS as DEFAULT_LABELS } from "@labels";
import { DEFAULT_GRID_UNIT } from '@config';

type CountLike = 
    | number
    | { count?: number; unit?: string }
    | undefined;

type GridMatrixControls = {
  resize: (cols: number, rows: number) => void;
};

type LabelsShape = typeof DEFAULT_LABELS.tokenGridNotice;

type Props = {
    clientId: string | null;
    columnData: CountLike;
    rowData: CountLike;
    gridMatrix: GridMatrixControls;
    labels?: LabelsShape;
};

export default function TokenGridNoticePanel({ 
    clientId,
    columnData,
    rowData,
    gridMatrix,
    labels = DEFAULT_LABELS.tokenGridNotice
}: Props) {
    if (!clientId) return null;

    const { set } = useAttrSetter(clientId ?? '');
    const model = useGridModel(clientId);

    // ConfirmDialog state
    const [isConfirmOpen, setConfirmOpen] = useState(false);

    // Normalised sizes (areas)
    const areaCols = Number(columnData) || 0;
    const areaRows = Number(rowData) || 0;

    // Normalised sizes (tracks)
    const colInfo = countTracks(model?.columns?.template ?? '');
    const rowInfo = countTracks(model?.rows?.template ?? '');
    const trackCols = toCount((colInfo as any)?.count ?? colInfo); // e.g. '1fr'
    const trackRows = toCount((rowInfo as any)?.count ?? rowInfo);

    const colUnit =
        typeof colInfo === 'object' && 'unit' in colInfo && colInfo.unit
            ? colInfo.unit
            : DEFAULT_GRID_UNIT;

    const rowUnit =
        typeof rowInfo === 'object' && 'unit' in rowInfo && rowInfo.unit
            ? rowInfo.unit
            : DEFAULT_GRID_UNIT;

    const columnsMismatch = areaCols !== trackCols;
    const rowsMismatch = areaRows !== trackRows;
    const canShrinkTracks = areaCols < trackCols || areaRows < trackRows;

    const resizeAreasToTracks = useCallback(() => {
        const targetCols = trackCols || areaCols || 1;
        const targetRows = trackRows || areaRows || 1;
        gridMatrix.resize(targetCols, targetRows);
    }, [gridMatrix.resize, trackCols, trackRows, areaCols, areaRows]);

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

        // bail if nothing changes
        if (nextColumns === curCols && nextRows === curRows) return;

        set('gridTemplateColumns', nextColumns);
        set('gridTemplateRows', nextRows);
    }, [areaCols, areaRows, colUnit, rowUnit, model, needGrowCols, needGrowRows, set]);

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

    // useEffect(() => {
    //     console.log('[Mismatch check]', { areaCols, areaRows, trackCols, trackRows });
    // }, [areaCols, areaRows, trackCols, trackRows]);

    if (!columnsMismatch && !rowsMismatch) return null;

    return (
        <Flex direction="column" gap={2} className="costered-blocks--grid-area-notices">
            <Notice status="info" isDismissible={false}>
                {sprintf(labels.mismatchText, areaCols, areaRows, trackCols, trackRows)}
                <Flex direction="column" gap={2} style={{ marginTop: 8 }}>
                    <FlexBlock>
                        <Button 
                            variant="secondary"
                            onClick={resizeAreasToTracks}
                        >
                            {labels.resizeToTracks}
                        </Button>
                    </FlexBlock>
                    {(needGrowCols || needGrowRows) && (
                        <FlexBlock>
                            <Button
                                variant="secondary"
                                onClick={growTracksToAreas}
                                disabled={!needGrowCols && !needGrowRows}
                            >
                                {labels.growTracksToAreas}
                            </Button>
                        </FlexBlock>
                    )}
                    {canShrinkTracks && (
                        <FlexBlock>
                            <Button
                                variant="secondary"
                                isDestructive
                                onClick={requestShrink}
                            >
                                {labels.shrinkTracks.button}
                            </Button>
                        </FlexBlock>
                    )}
                </Flex>
            </Notice>
            {canShrinkTracks && (
                <Notice
                    status="warning"
                    isDismissible={false}
                    className="costered-blocks--grid-area-notice--shrink-warning"
                >
                    <span>{labels.shrinkTracks.warning}</span>
                </Notice>
            )}
            <ConfirmDialog
                isOpen={isConfirmOpen}
                onConfirm={() => { 
                    performShrink(); 
                    setConfirmOpen(false); 
                }}
                onCancel={() => setConfirmOpen(false)}
                confirmButtonText={labels.shrinkTracks.confirm}
                cancelButtonText={labels.shrinkTracks.cancel}
            >
                <Heading>{labels.shrinkTracks.heading}</Heading>
                <p>{labels.shrinkTracks.description}</p>
            </ConfirmDialog>
        </Flex>
    );
}