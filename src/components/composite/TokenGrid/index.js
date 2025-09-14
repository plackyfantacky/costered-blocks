import { useState, useCallback, useRef, useMemo } from '@wordpress/element';
import { Button, Flex, FlexItem } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';

import { useGridAreasMatrix, useGridStoreAreasIO } from '@hooks';
import { GridBoard } from './GridBoard';
import { NoticePanel } from './NoticePanel';
import { LABELS } from '@labels';

export default function TokenGrid({ clientId }) {
    const {
        applyMatrixToStore,
        seedFromStore,
        trackColumnCount,
        trackRowCount,
    } = useGridStoreAreasIO(clientId);

    const seedMatrix = useMemo(() => seedFromStore('.'), [seedFromStore]);

    // Suspend/resume resync around editing
    const [isEditing, setIsEditing] = useState(false);
    const resumeRef = useRef(null);

    const handleEditingChange = useCallback((editing) => {
        if (resumeRef.current) clearTimeout(resumeRef.current);
        if (editing) setIsEditing(true);
        else resumeRef.current = setTimeout(() => setIsEditing(false), 60);
    }, []);

    const gridMatrix = useGridAreasMatrix({
        seedMatrix,
        emptyToken: '.',
        onApply: applyMatrixToStore,
        suspendResync: isEditing,
    });
    const { matrix, setCell, resize, clear } = gridMatrix;

    const columnData = matrix[0]?.length || 0;
    const rowData = matrix.length || 0;

    const mismatch = (
        (trackColumnCount || 0) !== columnData || (trackRowCount || 0) !== rowData
    );

    return (
        <div className="costered-blocks-tokengrid">
            {mismatch && (
                <>
                    <NoticePanel clientId={clientId} columnData={columnData} rowData={rowData} gridMatrix={gridMatrix} /> {/* passthrough resize function */ }
                </>
            )}
            <Flex direction="row" gap={2} align="center" justify="space-between" style={{ marginBottom: 8 }} className={"costered-blocks-tokengrid__header"}>
                <FlexItem>
                    <strong>{LABELS.tokenGrid.title}</strong>{' '}
                    <span className="components-help-text">
                        {sprintf(LABELS.tokenGrid.sizeHint, columnData, rowData)}
                    </span>
                </FlexItem>
                <FlexItem>
                    <Button
                        icon="trash"
                        variant="tertiary"
                        onClick={() => clear(trackColumnCount, trackRowCount)}
                    >
                        {LABELS.tokenGrid.clear}
                    </Button>
                </FlexItem>
            </Flex>
            <GridBoard
                matrix={matrix}
                columnData={columnData}
                rowData={rowData}
                emptyToken={'.'}
                labels={LABELS.tokenGrid}
                setCell={setCell}
                resize={resize}
                onEditingChange={handleEditingChange}
            />
        </div>
    );
}